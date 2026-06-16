"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "./app-header";
import { FindingsPanel } from "./findings-panel";
import { InputPanel } from "./input-panel";
import { ReportPreview } from "./report-preview";
import { SessionHistory } from "./session-history";
import { TraceTimeline } from "./trace-timeline";
import { sampleList } from "@/lib/samples";
import { clearSessions, loadSessions, saveSession } from "@/lib/storage";
import type { AgentEvent, AuditResponse, InputType, Intensity, Provider } from "@/lib/types";

export function AuditWorkbench() {
  const firstSample = sampleList[0];
  const [content, setContent] = useState(firstSample.content);
  const [inputType, setInputType] = useState<InputType>(firstSample.inputType);
  const [provider, setProvider] = useState<Provider>("mock");
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [sessions, setSessions] = useState<AuditResponse[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSessions(loadSessions()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function runAudit() {
    setIsRunning(true);
    setError(null);
    setEvents([
      {
        stage: "intake",
        status: "running",
        title: "Audit request queued",
        detail: "The workbench is validating input and routing the provider request.",
      },
    ]);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, inputType, provider, intensity }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Audit request failed.");
      }

      const audit = payload as AuditResponse;
      setResult(audit);
      setEvents(audit.events);
      saveSession(audit);
      setSessions(loadSessions());
    } catch (auditError) {
      const message = auditError instanceof Error ? auditError.message : "Audit request failed.";
      setError(message);
      setEvents([
        {
          stage: "inspect",
          status: "error",
          title: "Audit failed",
          detail: message,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }

  function restoreSession(session: AuditResponse) {
    setResult(session);
    setEvents(session.events);
    setProvider(session.provider);
    setInputType(session.inputMeta.inputType);
    setIntensity(session.inputMeta.intensity);
    setError(null);
  }

  function resetInput() {
    setContent("");
    setResult(null);
    setEvents([]);
    setError(null);
  }

  function clearHistory() {
    clearSessions();
    setSessions([]);
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-100">
      <AppHeader provider={provider} />
      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)_380px] lg:p-6">
        <div className="grid content-start gap-4">
          <InputPanel
            content={content}
            inputType={inputType}
            provider={provider}
            intensity={intensity}
            isRunning={isRunning}
            onContentChange={setContent}
            onInputTypeChange={setInputType}
            onProviderChange={setProvider}
            onIntensityChange={setIntensity}
            onRun={runAudit}
            onReset={resetInput}
          />
          <SessionHistory sessions={sessions} onRestore={restoreSession} onClear={clearHistory} />
        </div>

        <div className="grid content-start gap-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
              {error}
            </div>
          ) : null}
          <TraceTimeline events={events} isRunning={isRunning} />
          <ReportPreview markdown={result?.reportMarkdown} />
        </div>

        <FindingsPanel result={result} />
      </div>
    </main>
  );
}
