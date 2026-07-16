"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, RotateCw, Sparkles, Maximize2, Download, X } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { cn, apiFetch } from "@/lib/utils";
import type { Plan, LandingOption } from "@/lib/types";
import { SELECTABLE_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";

export default function LandingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai_model") || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  });
  const [regenerating, setRegenerating] = useState(false);
  const [previewOption, setPreviewOption] = useState<LandingOption | null>(null);

  function downloadHtml(opt: LandingOption) {
    const blob = new Blob([opt.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan?.structure?.appName || "landing"}-${opt.styleName.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
              onChange={(e) => { setSelectedModel(e.target.value); localStorage.setItem("ai_model", e.target.value); }}
              className="rounded border border-line bg-ink px-2.5 py-1.5 text-xs text-paper font-mono focus:border-signal focus:outline-none"
            >
              {SELECTABLE_MODELS.map((m) => (
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
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewOption(opt); }}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-ink-raised-2 hover:text-paper"
                  title="Preview fullscreen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadHtml(opt); }}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-ink-raised-2 hover:text-paper"
                  title="Download HTML"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                {selected === opt.id && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal text-ink">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewOption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewOption(null)}
        >
          <div
            className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-line bg-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-3">
              <p className="font-display font-semibold text-paper">{previewOption.styleName}</p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => downloadHtml(previewOption)}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Download HTML
                </Button>
                <button
                  onClick={() => setPreviewOption(null)}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-ink-raised hover:text-paper"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <iframe
                srcDoc={previewOption.html}
                title={previewOption.styleName}
                sandbox="allow-scripts"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      <StepNav
        prevLabel="Kembali ke PRD"
        prevHref={`/plans/${id}/prd`}
        nextLabel="Select & Continue to Task"
        nextDisabled={!selected}
        nextLoading={advancing}
        onNext={confirmAndContinue}
      />
    </div>
  );
}
