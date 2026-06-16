import type { AuditReportInput } from "./types";

function formatFindingLine(finding: AuditReportInput["findings"][number], index: number) {
  const location = [finding.file, finding.line ? `line ${finding.line}` : ""]
    .filter(Boolean)
    .join(": ");

  return [
    `### ${index + 1}. ${finding.title}`,
    `- Severity: ${finding.severity}`,
    `- Category: ${finding.category}`,
    location ? `- Location: ${location}` : undefined,
    `- Evidence: ${finding.evidence}`,
    `- Recommendation: ${finding.recommendation}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateReportMarkdown({
  summary,
  riskScore,
  findings,
  evalCard,
}: AuditReportInput) {
  const findingSection =
    findings.length > 0
      ? findings.map((finding, index) => formatFindingLine(finding, index)).join("\n\n")
      : "No blocking findings were detected in this audit pass.";

  return [
    "# HarnessLab Audit Report",
    "",
    "## Summary",
    summary,
    "",
    `Risk Score: ${riskScore}`,
    "",
    "## Findings",
    findingSection,
    "",
    "## Eval Card",
    `- Reproducibility: ${evalCard.reproducibility}`,
    `- Traceability: ${evalCard.traceability}`,
    `- Testability: ${evalCard.testability}`,
    `- Confidence: ${evalCard.confidence}`,
    `- Score: ${evalCard.score}`,
    "",
    "> Eval card scores describe the audit process quality, not absolute code quality.",
  ].join("\n");
}
