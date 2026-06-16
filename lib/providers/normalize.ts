import { auditResponsePayloadSchema } from "../schemas";
import type { AuditRequest, AuditResponse } from "../types";
import { parseAuditInput } from "../parser";
import { generateReportMarkdown } from "../report";

export function extractJsonObject(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return text.slice(first, last + 1);
}

export function normalizeProviderPayload(
  rawPayload: unknown,
  request: AuditRequest,
  provider: AuditResponse["provider"],
  model?: string,
): AuditResponse {
  const parsedPayload = auditResponsePayloadSchema.parse(rawPayload);
  const input = parseAuditInput(request);
  const reportMarkdown =
    parsedPayload.reportMarkdown ??
    generateReportMarkdown({
      summary: parsedPayload.summary,
      riskScore: parsedPayload.riskScore,
      findings: parsedPayload.findings,
      evalCard: parsedPayload.evalCard,
    });

  return {
    id: `audit_${input.contentHash}_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    provider,
    model,
    summary: parsedPayload.summary,
    riskScore: parsedPayload.riskScore,
    inputMeta: {
      inputType: request.inputType,
      intensity: request.intensity,
      contentHash: input.contentHash,
      estimatedLines: input.estimatedLines,
    },
    events: parsedPayload.events,
    findings: parsedPayload.findings,
    evalCard: parsedPayload.evalCard,
    reportMarkdown,
  };
}
