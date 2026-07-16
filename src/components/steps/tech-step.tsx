"use client";

import { useState, useEffect } from "react";
import { Sparkles, SlidersHorizontal, Loader2, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/utils";
import { SELECTABLE_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";
import type { TechChoice, TechMode } from "@/lib/types";

export function TechStep({
  planId,
  onDone,
}: {
  planId: string;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<TechMode | null>(null);
  const [manual, setManual] = useState<TechChoice>({ frontend: "", backend: "", database: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_model") || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  });

  // Persist model selection to localStorage so apiFetch picks it up
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_model", selectedModel);
    }
  }, [selectedModel]);

  async function submit() {
    if (!mode) return;
    if (mode === "manual" && (!manual.frontend || !manual.backend || !manual.database)) {
      setError("Isi frontend, backend, dan database dulu ya.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/plans/${planId}/tech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "ai" ? { mode } : { mode, choice: manual }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pilihan tech stack.");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-paper">Preferensi teknologi</h1>
      <p className="mt-2 text-muted">
        Udah punya pilihan tech stack, atau mau AI yang tentuin?
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card
          onClick={() => setMode("ai")}
          className={`cursor-pointer p-6 transition-colors ${
            mode === "ai" ? "border-signal" : "hover:border-line"
          }`}
        >
          <Sparkles className={`h-5 w-5 ${mode === "ai" ? "text-signal" : "text-muted"}`} />
          <h3 className="mt-3 font-display font-semibold text-paper">Biarkan AI pilih</h3>
          <p className="mt-1.5 text-sm text-muted">
            AI rekomendasiin stack yang paling praktis buat ide kamu.
          </p>
        </Card>

        <Card
          onClick={() => setMode("manual")}
          className={`cursor-pointer p-6 transition-colors ${
            mode === "manual" ? "border-trace" : "hover:border-line"
          }`}
        >
          <SlidersHorizontal className={`h-5 w-5 ${mode === "manual" ? "text-trace" : "text-muted"}`} />
          <h3 className="mt-3 font-display font-semibold text-paper">Pilih sendiri</h3>
          <p className="mt-1.5 text-sm text-muted">Kamu tentuin teknologi yang mau dipakai.</p>
        </Card>
      </div>

      {/* Model selector */}
      <div className="mt-6 rounded-xl border border-line bg-ink-raised p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-trace" />
          <label className="font-mono text-xs uppercase tracking-wide text-muted">
            Model Gemini AI
          </label>
        </div>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper font-mono focus:border-signal focus:outline-none"
        >
          {SELECTABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}{m.freeTier ? " (Gratis)" : " (Billing)"}</option>
          ))}
        </select>
        <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
          Pilih model AI yang akan dipakai buat generate semua konten. <span className="text-trace">(Gratis)</span> = bisa tanpa billing,
          <span className="text-muted ml-1">(Billing)</span> = perlu billing account. Model lebih baru = hasil lebih bagus tapi bisa lebih lambat/kena limit.
        </p>
      </div>

      {mode === "manual" && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-ink-raised p-5">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted">
              Frontend
            </label>
            <Input
              placeholder="Next.js 15, TypeScript, Tailwind"
              value={manual.frontend}
              onChange={(e) => setManual((m) => ({ ...m, frontend: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted">
              Backend
            </label>
            <Input
              placeholder="Next.js API Routes"
              value={manual.backend}
              onChange={(e) => setManual((m) => ({ ...m, backend: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted">
              Database
            </label>
            <Input
              placeholder="PostgreSQL + Prisma"
              value={manual.database}
              onChange={(e) => setManual((m) => ({ ...m, database: e.target.value }))}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-8 flex justify-end">
        <Button onClick={submit} disabled={!mode || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lanjut"}
        </Button>
      </div>
    </div>
  );
}
