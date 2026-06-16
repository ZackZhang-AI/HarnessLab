import { describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/audit/route";

function request(body: unknown) {
  return new Request("http://localhost/api/audit", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/audit", () => {
  it("returns a mock audit response", async () => {
    const response = await POST(
      request({
        content: "const sql = `select * from users where id = ${id}`;",
        inputType: "files",
        provider: "mock",
        intensity: "quick",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.provider).toBe("mock");
    expect(json.events.length).toBeGreaterThan(0);
    expect(json.reportMarkdown).toContain("HarnessLab Audit Report");
  });

  it("returns validation errors for invalid input", async () => {
    const response = await POST(
      request({
        content: "",
        inputType: "diff",
        provider: "mock",
        intensity: "quick",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns a configuration error when DeepSeek key is missing", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");

    const response = await POST(
      request({
        content: "const ok = true;",
        inputType: "files",
        provider: "deepseek",
        intensity: "quick",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/DEEPSEEK_API_KEY/);
  });
});
