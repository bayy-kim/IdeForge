"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Download, Printer, Edit3, Save, RotateCw, X } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export default function PrdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrd, setEditedPrd] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${id}/prd`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else {
          setPlan(data.plan);
          setEditedPrd(data.plan.prd || "");
        }
      })
      .catch(() => !cancelled && setError("Gagal memuat PRD."));
    return () => {
      cancelled = true;
    };
  }, [id]);

  function downloadMd() {
    if (!plan?.prd) return;
    const blob = new Blob([plan.prd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.structure?.appName || "prd"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    window.print();
  }

  async function handleRegenerate() {
    if (!confirm("Apakah Anda yakin ingin men-generate ulang PRD? Hasil edit manual (jika ada) akan hilang.")) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/plans/${id}/prd?regenerate=true`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan regenerasi.");
      setPlan(data.plan);
      setEditedPrd(data.plan.prd || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal melakukan regenerasi.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/plans/${id}/prd`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd: editedPrd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");
      setPlan(data.plan);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  async function goToLanding() {
    setAdvancing(true);
    router.push(`/plans/${id}/landing`);
  }

  if (error && !plan) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!plan?.prd || regenerating) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">Product Requirement Document</h1>
          <p className="mt-1 text-sm text-muted">{plan.structure?.appName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <span className="mr-1 text-xs">...</span> : <Save className="h-3.5 w-3.5 mr-1" />} Simpan
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Batal
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Manual
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                <RotateCw className="h-3.5 w-3.5 mr-1" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMd}>
                <Download className="h-3.5 w-3.5 mr-1" /> .md
              </Button>
              <Button variant="outline" size="sm" onClick={printPdf}>
                <Printer className="h-3.5 w-3.5 mr-1" /> .pdf / Cetak
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-danger no-print">{error}</p>}

      <div className="rounded-xl border border-line bg-ink-raised p-8 print-content">
        {isEditing ? (
          <textarea
            value={editedPrd}
            onChange={(e) => setEditedPrd(e.target.value)}
            className="w-full min-h-[500px] border-none bg-transparent text-paper font-mono text-sm leading-relaxed focus:outline-none"
            placeholder="Tulis PRD dalam format Markdown..."
          />
        ) : (
          <article className="prose prose-invert prose-ideforge max-w-none prose-headings:font-display">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.prd}</ReactMarkdown>
          </article>
        )}
      </div>

      <StepNav
        prevLabel="Kembali ke struktur"
        prevHref={`/plans/${id}/structure`}
        nextLabel="Lanjut ke Landing"
        nextLoading={advancing}
        nextDisabled={isEditing}
        onNext={goToLanding}
      />
    </div>
  );
}
