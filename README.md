# HarnessLab

HarnessLab is a Vercel-ready Code Agent Audit Workbench that turns pasted diffs into observable AI audit traces, structured findings, risk scores, and exportable review reports.

It is not a generic AI chat wrapper. The product surface is built around Harness Engineering: input intake, planning, inspection, finding extraction, evaluation, and report generation are visible as first-class trace artifacts.

## Why This Exists

AI coding products are moving from one-shot model calls toward observable Agent Harness systems. HarnessLab explores that shift in a focused code review scenario:

- The model is not the product surface. The audit process is.
- The trace is inspectable, so a reviewer can see how the Agent reached a verdict.
- The eval card scores audit-process quality, not absolute code quality.
- The mock provider makes the project demo-friendly without an API key.

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

## Architecture

```text
User Input
  -> Input Parser
  -> Audit Request Validator
  -> Provider Router
      -> Mock Provider
      -> DeepSeek Provider
  -> Response Normalizer
  -> Report Generator
  -> API Response
  -> Trace Timeline / Findings Panel / Export / localStorage
```

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- lucide-react
- react-markdown
- Vitest
- Playwright
- Vercel deployment target

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

## Vercel Deployment

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Optionally add `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL`.
4. Deploy. Mock Demo works even without environment variables.

## Project Positioning

HarnessLab is designed as a portfolio-grade AI engineering project. It demonstrates:

- Agent workflow productization.
- Structured model output validation.
- Provider routing and graceful fallback paths.
- Observable trace design.
- Eval-driven code review UX.

Suggested GitHub topics:

```text
agent, harness-engineering, deepseek, code-review, ai-workbench
```
