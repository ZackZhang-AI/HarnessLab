import type { AuditRequest, AuditResponse } from "../types";
import { runDeepSeekAudit } from "./deepseek";
import { runMockAudit } from "./mock";

export async function runAuditProvider(request: AuditRequest): Promise<AuditResponse> {
  if (request.provider === "deepseek") {
    return runDeepSeekAudit(request);
  }

  return runMockAudit(request);
}
