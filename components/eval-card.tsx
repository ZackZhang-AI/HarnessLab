import type { EvalCard } from "@/lib/types";

type EvalCardViewProps = {
  evalCard: EvalCard | null;
};

const metrics: Array<keyof EvalCard> = [
  "reproducibility",
  "traceability",
  "testability",
  "confidence",
  "score",
];

export function EvalCardView({ evalCard }: EvalCardViewProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-950">Eval Card</h2>
      <div className="mt-3 grid gap-2">
        {metrics.map((metric) => (
          <div key={metric} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <span className="text-sm capitalize text-zinc-700">{metric}</span>
            <span className="font-mono text-sm font-semibold text-zinc-950">{evalCard?.[metric] ?? 0}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Eval scores describe audit-process quality, not absolute code quality.
      </p>
    </section>
  );
}
