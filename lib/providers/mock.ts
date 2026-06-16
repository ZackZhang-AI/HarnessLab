import { parseAuditInput } from "../parser";
import { generateReportMarkdown } from "../report";
import type { AgentEvent, AuditRequest, AuditResponse, EvalCard, Finding } from "../types";

function includesAny(content: string, terms: string[]) {
  const lower = content.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function firstFile(files: string[]) {
  return files[0] ?? "pasted-snippet.ts";
}

function buildFindings(request: AuditRequest): Finding[] {
  const parsed = parseAuditInput(request);
  const file = firstFile(parsed.files);
  const line = parsed.lineHints[0] ?? 1;
  const findings: Finding[] = [];

  if (includesAny(request.content, ["auth", "userid", "admin"])) {
    findings.push({
      severity: "high",
      category: "security",
      file,
      line,
      title: "Missing authorization boundary",
      evidence: "The change references userId, admin, or auth-sensitive flow without a visible server-side permission check.",
      recommendation: "Resolve the acting user from a trusted session and enforce authorization before reading or mutating protected data.",
    });
  }

  if (includesAny(request.content, ["query", "sql", "select *", "${"])) {
    findings.push({
      severity: "high",
      category: "security",
      file,
      line,
      title: "Possible SQL injection through string-built query",
      evidence: "The snippet builds a query string from runtime values instead of using a parameterized statement.",
      recommendation: "Replace string interpolation with prepared statements or ORM parameter binding.",
    });
  }

  if (/\bcatch\s*\([^)]*\)\s*{\s*}/m.test(request.content) || includesAny(request.content, ["catch (", "catch("])) {
    findings.push({
      severity: "medium",
      category: "reliability",
      file,
      line,
      title: "Error path may be swallowed",
      evidence: "The change includes a catch path without clear logging, recovery, or user-facing failure handling.",
      recommendation: "Log the failure context and return a typed error response or retry path.",
    });
  }

  if (!includesAny(request.content, ["test(", "expect(", ".spec.", ".test.", "describe("])) {
    findings.push({
      severity: "medium",
      category: "testing",
      file,
      title: "Risky change lacks test evidence",
      evidence: "No test file or assertion marker appears in the submitted diff or snippet.",
      recommendation: "Add a focused regression test that covers the changed authorization, validation, or persistence behavior.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "info",
      category: "maintainability",
      file,
      title: "No high-signal issue detected by mock heuristics",
      evidence: "The mock provider did not find auth, SQL, swallowed error, or obvious test coverage markers.",
      recommendation: "Run the DeepSeek provider for semantic review before relying on this result.",
    });
  }

  return findings;
}

function score(findings: Finding[]) {
  const weights = { critical: 95, high: 72, medium: 48, low: 26, info: 10 };
  return Math.min(100, Math.max(...findings.map((finding) => weights[finding.severity])));
}

function buildEvalCard(findings: Finding[], request: AuditRequest): EvalCard {
  const hasStructuredEvidence = findings.every((finding) => finding.evidence && finding.recommendation);
  const confidence = request.intensity === "standard" ? 82 : 72;

  return {
    reproducibility: 94,
    traceability: hasStructuredEvidence ? 88 : 65,
    testability: findings.some((finding) => finding.category === "testing") ? 68 : 78,
    confidence,
    score: Math.round((94 + (hasStructuredEvidence ? 88 : 65) + confidence) / 3),
  };
}

function buildEvents(request: AuditRequest, findings: Finding[]): AgentEvent[] {
  const parsed = parseAuditInput(request);
  const fileLabel = parsed.files.length ? parsed.files.join(", ") : "pasted content";

  return [
    {
      stage: "intake",
      status: "complete",
      title: "Input intake",
      detail: `Parsed ${parsed.estimatedLines} lines from ${fileLabel}.`,
      artifact: `contentHash=${parsed.contentHash}`,
    },
    {
      stage: "plan",
      status: "complete",
      title: "Review plan",
      detail: "Prioritized security, reliability, validation, test coverage, and maintainability checks.",
      artifact: request.intensity === "standard" ? "standard audit: expanded issue extraction" : "quick audit: top-risk pass",
    },
    {
      stage: "inspect",
      status: "complete",
      title: "Inspection",
      detail: "Scanned for auth boundary drift, string-built persistence calls, swallowed errors, and missing tests.",
    },
    {
      stage: "finding",
      status: findings.some((finding) => finding.severity === "high" || finding.severity === "critical")
        ? "warning"
        : "complete",
      title: "Finding extraction",
      detail: `Extracted ${findings.length} structured finding${findings.length === 1 ? "" : "s"}.`,
    },
    {
      stage: "evaluate",
      status: "complete",
      title: "Harness evaluation",
      detail: "Scored traceability, reproducibility, testability, and confidence for the audit run.",
    },
    {
      stage: "report",
      status: "complete",
      title: "Report generation",
      detail: "Generated Markdown and JSON artifacts for review handoff.",
    },
  ];
}

export async function runMockAudit(request: AuditRequest): Promise<AuditResponse> {
  const parsed = parseAuditInput(request);
  const findings = buildFindings(request);
  const riskScore = score(findings);
  const evalCard = buildEvalCard(findings, request);
  const summary =
    findings[0]?.severity === "info"
      ? "Mock audit did not detect blocking risk, but recommends a semantic provider pass."
      : `Mock audit found ${findings.length} review concern${findings.length === 1 ? "" : "s"}, led by ${findings[0]?.title.toLowerCase()}.`;
  const reportMarkdown = generateReportMarkdown({ summary, riskScore, findings, evalCard });

  return {
    id: `audit_${parsed.contentHash}_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    provider: "mock",
    model: "mock-heuristic-v1",
    summary,
    riskScore,
    inputMeta: {
      inputType: request.inputType,
      intensity: request.intensity,
      contentHash: parsed.contentHash,
      estimatedLines: parsed.estimatedLines,
    },
    events: buildEvents(request, findings),
    findings,
    evalCard,
    reportMarkdown,
  };
}
