"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, Check, PartyPopper, ChevronLeft, Download, Wrench } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn, apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

type Tab = "prompt" | "skills";

export default function PromptPage() {
  const { id } = useParams() as { id: string };
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("prompt");

  function downloadMd() {
    if (!plan?.finalPrompt) return;
    const blob = new Blob([plan.finalPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.structure?.appName || "prompt"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${id}/prompt`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setPlan(data.plan);
      })
      .catch(() => !cancelled && setError("Gagal membuat prompt."));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const sections = useMemo(() => {
    if (!plan?.finalPrompt) return [];
    const lines = plan.finalPrompt.split("\n");
    const result: { heading: string; content: string }[] = [];
    let currentHeading = "Pendahuluan";
    let currentLines: string[] = [];
    for (const line of lines) {
      const match = line.match(/^##\s+(.+)/);
      if (match) {
        if (currentLines.length) {
          result.push({ heading: currentHeading, content: currentLines.join("\n") });
        }
        currentHeading = match[1];
        currentLines = [line];
      } else {
        currentLines.push(line);
      }
    }
    if (currentLines.length) {
      result.push({ heading: currentHeading, content: currentLines.join("\n") });
    }
    return result;
  }, [plan]);

  async function copy() {
    if (!plan?.finalPrompt) return;
    await navigator.clipboard.writeText(plan.finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copySection(content: string, heading: string) {
    await navigator.clipboard.writeText(content);
    setCopiedSection(heading);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!plan?.finalPrompt) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <PartyPopper className="h-5 w-5 text-signal" />
        <h1 className="font-display text-2xl font-bold text-paper">Prompt siap pakai</h1>
      </div>
      <p className="mb-6 text-sm text-muted">
        Tempel prompt ini ke Claude Code, Cursor, atau AI coding assistant favoritmu untuk mulai
        membangun <strong className="text-paper">{plan.structure?.appName}</strong>.
      </p>

      <div className="no-print mb-4 flex gap-1 rounded-lg border border-line bg-ink-raised p-1">
        <button
          onClick={() => setActiveTab("prompt")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "prompt" ? "bg-signal text-ink" : "text-muted hover:text-paper",
          )}
        >
          <Copy className="h-4 w-4" /> Prompt
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "skills" ? "bg-signal text-ink" : "text-muted hover:text-paper",
          )}
        >
          <Wrench className="h-4 w-4" /> Persiapan & Skill
        </button>
      </div>

      {activeTab === "prompt" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={downloadMd}>
              <Download className="h-3.5 w-3.5 mr-1" /> .md
            </Button>
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? (
                <><Check className="h-3.5 w-3.5 text-trace" /> Disalin</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Salin semua</>
              )}
            </Button>
          </div>
          {sections.map((sec) => (
            <div key={sec.heading} className="relative rounded-xl border border-line bg-ink-raised-2 p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-paper">
                  {sec.heading.startsWith("##") ? sec.heading : `## ${sec.heading}`}
                </p>
                <button
                  onClick={() => copySection(sec.content, sec.heading)}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] text-trace transition-colors hover:bg-ink-raised hover:text-paper"
                >
                  {copiedSection === sec.heading ? (
                    <><Check className="h-3 w-3" /> Disalin</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Salin bagian</>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-paper">
                {sec.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {activeTab === "skills" && (
        <div className="rounded-xl border border-line bg-ink-raised p-8">
          {plan.requiredSkills ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-trace">
                <Wrench className="h-4 w-4" />
                <p className="text-xs font-mono font-medium uppercase tracking-wider">
                  Analisis dari PRD &mdash; download & install dulu sebelum mulai coding
                </p>
              </div>
              <article className="prose prose-invert prose-ideforge max-w-none prose-headings:font-display">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.requiredSkills}</ReactMarkdown>
              </article>
            </>
          ) : (
            <p className="text-sm text-muted text-center py-12">
              Daftar skill & dependensi akan dibuat otomatis setelah prompt selesai di-generate.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href={`/plans/${id}/tasks`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke task
        </Link>
      </div>
    </div>
  );
}
