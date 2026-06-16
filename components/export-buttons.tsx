"use client";

import { Download } from "lucide-react";
import type { AuditResponse } from "@/lib/types";

type ExportButtonsProps = {
  result: AuditResponse | null;
};

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ result }: ExportButtonsProps) {
  return (
    <section className="grid gap-2">
      <button
        type="button"
        disabled={!result}
        onClick={() => result && download(`${result.id}.md`, result.reportMarkdown, "text/markdown")}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 active:translate-y-px disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export Markdown
      </button>
      <button
        type="button"
        disabled={!result}
        onClick={() =>
          result && download(`${result.id}.json`, JSON.stringify(result, null, 2), "application/json")
        }
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 active:translate-y-px disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export JSON
      </button>
    </section>
  );
}
