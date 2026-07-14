"use client";

import { useState } from "react";
import { Sparkles, SlidersHorizontal, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/utils";
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
