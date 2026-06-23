# HarnessLab

HarnessLab is a Vercel-ready Code Agent Audit Workbench that turns pasted diffs into observable AI audit traces, structured findings, risk scores, and exportable review reports.

It is not a generic AI chat wrapper. The product surface is built around Harness Engineering: input intake, planning, inspection, finding extraction, evaluation, and report generation are visible as first-class trace artifacts.

## Features

- Paste a unified diff or file snippet.
- Choose `mock` or `deepseek` provider.
- Choose `quick` or `standard` audit intensity.
- View the Harness timeline from intake to report.
- Inspect structured findings with severity, evidence, and recommendations.
- Review risk score and eval card.
- Export Markdown report and JSON trace.
- Restore recent sessions from browser localStorage.
- Deploy on Vercel with mock mode working by default.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and run a sample audit with Mock Demo.

## DeepSeek Provider

Create `.env.local`:

```bash
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
```

Then select `DeepSeek` in the provider menu. DeepSeek calls are made server-side through `POST /api/audit`, so the API key is never exposed to the browser.

## Tests

```bash
npm test
npm run lint
npm run build
npx playwright test
```

## License

MIT
