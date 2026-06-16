import ReactMarkdown from "react-markdown";

type ReportPreviewProps = {
  markdown?: string;
};

export function ReportPreview({ markdown }: ReportPreviewProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-950">Report Preview</h2>
        <p className="mt-1 text-sm text-zinc-600">Markdown output ready for PR comments or portfolio notes.</p>
      </div>
      {markdown ? (
        <div className="prose prose-zinc max-w-none text-sm leading-6 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-p:my-2 prose-ul:my-2">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-6 text-zinc-600">
          Run an audit to generate a structured Markdown report.
        </div>
      )}
    </section>
  );
}
