import { z } from "zod";
import { auditResponsePayloadSchema } from "../schemas";
import type { AuditRequest, AuditResponse } from "../types";
import { extractJsonObject, normalizeProviderPayload } from "./normalize";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export class ProviderConfigurationError extends Error {
  status = 400;
}

export class ProviderTimeoutError extends Error {
  status = 504;
}

export class ProviderResponseError extends Error {
  status = 502;
}

function systemPrompt() {
  return `You are HarnessLab, an observable code audit agent.

Review pasted diffs or file snippets and return a strict JSON audit object.

Focus on:
- security risks
- reliability bugs
- missing validation
- broken edge cases
- testing gaps
- maintainability issues

Do not return generic advice.
Every finding must include evidence and a concrete recommendation.
Return JSON only.`;
}

function userPrompt(request: AuditRequest) {
  return `Input type: ${request.inputType}
Audit intensity: ${request.intensity}

Code:
${request.content}

Return:
{
  "summary": "...",
  "riskScore": 0,
  "events": [],
  "findings": [],
  "evalCard": {
    "reproducibility": 0,
    "traceability": 0,
    "testability": 0,
    "confidence": 0,
    "score": 0
  },
  "reportMarkdown": "..."
}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 25000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderTimeoutError("DeepSeek request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runDeepSeekAudit(request: AuditRequest): Promise<AuditResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

  if (!apiKey) {
    throw new ProviderConfigurationError("Missing DEEPSEEK_API_KEY. Switch to Mock Demo or configure the server environment.");
  }

  const response = await fetchWithTimeout(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(request) },
      ],
      temperature: request.intensity === "quick" ? 0.1 : 0.2,
    }),
  });

  if (!response.ok) {
    throw new ProviderResponseError(`DeepSeek returned ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new ProviderResponseError("DeepSeek response did not include message content.");
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(content);
  } catch {
    const extracted = extractJsonObject(content);
    if (!extracted) {
      throw new ProviderResponseError("DeepSeek response was not valid JSON.");
    }
    rawPayload = JSON.parse(extracted);
  }

  try {
    auditResponsePayloadSchema.parse(rawPayload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ProviderResponseError(`DeepSeek JSON failed schema validation: ${error.issues[0]?.message ?? "unknown issue"}`);
    }
    throw error;
  }

  return normalizeProviderPayload(rawPayload, request, "deepseek", model);
}
