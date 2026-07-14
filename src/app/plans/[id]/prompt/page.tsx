"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Copy, Check, PartyPopper, ChevronLeft, Download } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export default function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function copy() {
    if (!plan?.finalPrompt) return;
    await navigator.clipboard.writeText(plan.finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className="relative rounded-xl border border-line bg-ink-raised-2 p-6 font-mono text-sm leading-relaxed text-paper">
        <pre className="whitespace-pre-wrap">{plan.finalPrompt}</pre>
        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={downloadMd}>
            <Download className="h-3.5 w-3.5 mr-1" /> .md
          </Button>
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-trace" /> Disalin</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Salin</>
            )}
          </Button>
        </div>
      </div>

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
