import { afterEach, describe, expect, it, vi } from "vitest";
import { runDeepSeekAudit } from "../lib/providers/deepseek";

const validPayload = {
  summary: "DeepSeek found one issue.",
  riskScore: 61,
  events: [
    {
      stage: "intake",
      status: "complete",
      title: "Input intake",
      detail: "Parsed input.",
    },
  ],
  findings: [
    {
      severity: "medium",
      category: "testing",
      title: "Missing regression test",
      evidence: "No test assertion accompanies the change.",
      recommendation: "Add a targeted regression test before merge.",
    },
  ],
  evalCard: {
    reproducibility: 84,
    traceability: 80,
    testability: 72,
    confidence: 75,
    score: 78,
  },
};

describe("runDeepSeekAudit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("extracts valid JSON when the model wraps it in text", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: `Here is the result:\n${JSON.stringify(validPayload)}`,
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const result = await runDeepSeekAudit({
      content: "const ok = true;",
      inputType: "files",
      provider: "deepseek",
      intensity: "quick",
    });

    expect(result.provider).toBe("deepseek");
    expect(result.summary).toBe("DeepSeek found one issue.");
    expect(result.reportMarkdown).toContain("HarnessLab Audit Report");
  });

  it("throws a provider response error for non-json model content", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "not json" } }],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      runDeepSeekAudit({
        content: "const ok = true;",
        inputType: "files",
        provider: "deepseek",
        intensity: "quick",
      }),
    ).rejects.toThrow(/valid JSON/);
  });
});
