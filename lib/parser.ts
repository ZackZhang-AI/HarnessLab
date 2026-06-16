import { createHash } from "node:crypto";
import type { Intensity, InputType, ParsedAuditInput } from "./types";

type ParseInput = {
  content: string;
  inputType: InputType;
  intensity: Intensity;
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function parseAuditInput({ content, inputType, intensity }: ParseInput): ParsedAuditInput {
  const lines = content.split(/\r?\n/);
  const files: string[] = [];
  const lineHints: number[] = [];

  for (const line of lines) {
    const diffPath = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    const plusPath = line.match(/^\+\+\+ b\/(.+)$/);
    const fileHeader = line.match(/^File:\s*(.+)$/i);
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

    if (diffPath?.[2]) files.push(diffPath[2].trim());
    if (plusPath?.[1] && plusPath[1] !== "/dev/null") files.push(plusPath[1].trim());
    if (fileHeader?.[1]) files.push(fileHeader[1].trim());
    if (hunk?.[1]) lineHints.push(Number(hunk[1]));
  }

  return {
    inputType,
    intensity,
    files: unique(files),
    lineHints: [...new Set(lineHints)],
    estimatedLines: lines.length,
    contentHash: createHash("sha256").update(content).digest("hex").slice(0, 16),
  };
}
