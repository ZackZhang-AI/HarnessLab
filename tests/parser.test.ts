import { describe, expect, it } from "vitest";
import { parseAuditInput } from "../lib/parser";

describe("parseAuditInput", () => {
  it("extracts file paths and line hints from unified diffs", () => {
    const parsed = parseAuditInput({
      inputType: "diff",
      intensity: "standard",
      content: [
        "diff --git a/app/api/users.ts b/app/api/users.ts",
        "--- a/app/api/users.ts",
        "+++ b/app/api/users.ts",
        "@@ -10,6 +10,8 @@ export async function GET(req) {",
        "+ const userId = req.query.userId",
      ].join("\n"),
    });

    expect(parsed.files).toContain("app/api/users.ts");
    expect(parsed.lineHints).toContain(10);
    expect(parsed.estimatedLines).toBe(5);
    expect(parsed.contentHash).toMatch(/^[a-f0-9]{16}$/);
  });

  it("handles plain file snippets", () => {
    const parsed = parseAuditInput({
      inputType: "files",
      intensity: "quick",
      content: "File: lib/db.ts\nconst sql = `select * from users where id = ${id}`;",
    });

    expect(parsed.files).toContain("lib/db.ts");
    expect(parsed.estimatedLines).toBe(2);
  });
});
