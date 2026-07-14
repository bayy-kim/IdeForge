"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCw, Sparkles } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { cn, apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

const AVAILABLE_MODELS = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

export default function LandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${id}/landing`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else {
          setPlan(data.plan);
          setSelected(data.plan.selectedLandingId || data.plan.landingOptions?.[0]?.id || null);
        }
      })
      .catch(() => !cancelled && setError("Gagal memuat contoh landing page."));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/plans/${id}/landing?regenerate=true&model=${encodeURIComponent(selectedModel)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan regenerasi.");
      setPlan(data.plan);
      setSelected(data.plan.landingOptions?.[0]?.id || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal melakukan regenerasi.");
    } finally {
      setRegenerating(false);
    }
  }

  async function confirmAndContinue() {
    if (!selected) return;
    setAdvancing(true);
    try {
      const res = await apiFetch(`/api/plans/${id}/landing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedLandingId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pilihan.");
      router.push(`/plans/${id}/tasks`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setAdvancing(false);
    }
  }

  if (error && !plan) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!plan?.landingOptions || regenerating) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">Contoh landing page</h1>
          <p className="mt-1 text-sm text-muted">
            Pilih arah visual yang paling cocok — ini bakal jadi acuan desain di prompt final.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-trace" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper font-mono focus:border-signal focus:outline-none"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> Generate Ulang
          </Button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plan.landingOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={cn(
              "cursor-pointer overflow-hidden rounded-xl border-2 bg-ink-raised transition-colors",
              selected === opt.id ? "border-signal" : "border-line hover:border-line",
            )}
          >
            <div className="h-64 w-full overflow-hidden border-b border-line bg-white">
              <iframe
                srcDoc={opt.html}
                title={opt.styleName}
                sandbox="allow-scripts"
                className="h-[1000px] w-[1400px] origin-top-left scale-[0.257]"
              />
            </div>
            <div className="flex items-start justify-between gap-2 p-4">
              <div>
                <p className="font-display font-semibold text-paper">{opt.styleName}</p>
                <p className="mt-1 text-xs text-muted">{opt.styleDescription}</p>
              </div>
              {selected === opt.id && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal text-ink">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <StepNav
        prevLabel="Kembali ke PRD"
        prevHref={`/plans/${id}/prd`}
        nextLabel="Pilih & Lanjut ke Task"
        nextDisabled={!selected}
        nextLoading={advancing}
        onNext={confirmAndContinue}
      />
    </div>
  );
}
