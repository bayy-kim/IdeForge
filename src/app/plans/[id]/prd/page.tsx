"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Download, Printer, Save, RotateCw, X, FolderTree, FileText, Check } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { StepNav } from "@/components/step-nav";
import { cn, apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

type Tab = "prd" | "struktur";

export default function PrdPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("prd");

  const [isEditing, setIsEditing] = useState(false);
  const [editedPrd, setEditedPrd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [regenerating, setRegenerating] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  const wordCount = useMemo(() => {
    const text = isEditing ? editedPrd : (plan?.prd || "");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return words;
  }, [isEditing, editedPrd, plan?.prd]);

  const charCount = useMemo(() => {
    return (isEditing ? editedPrd : (plan?.prd || "")).length;
  }, [isEditing, editedPrd, plan?.prd]);

  const autoSave = useCallback(async (content: string) => {
    setSaveStatus("saving");
    try {
      const res = await apiFetch(`/api/plans/${id}/prd`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd: content }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setTimeout(() => { if (!isDirty.current) setSaveStatus("idle"); }, 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [id]);

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

  useEffect(() => {
    if (!isEditing) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      isDirty.current = false;
      autoSave(editedPrd);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [editedPrd, isEditing, autoSave]);

  function handleEditChange(value: string) {
    isDirty.current = true;
    setEditedPrd(value);
  }

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
          <p className="mt-1 font-mono text-[11px] text-trace">{wordCount} kata &middot; {charCount} karakter</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <div className="flex items-center gap-2 mr-2">
                {saveStatus === "saving" && <span className="text-[11px] text-muted font-mono">Menyimpan...</span>}
                {saveStatus === "saved" && <span className="text-[11px] text-trace font-mono flex items-center gap-1"><Check className="h-3 w-3" /> Tersimpan</span>}
                {saveStatus === "error" && <span className="text-[11px] text-danger font-mono">Gagal simpan</span>}
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <span className="mr-1 text-xs">...</span> : <Save className="h-3.5 w-3.5 mr-1" />} Simpan
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Kembali
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Save className="h-3.5 w-3.5 mr-1" /> Edit
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

      <div className="no-print mb-4 flex gap-1 rounded-lg border border-line bg-ink-raised p-1">
        <button
          onClick={() => { setActiveTab("prd"); setIsEditing(false); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "prd" ? "bg-signal text-ink" : "text-muted hover:text-paper",
          )}
        >
          <FileText className="h-4 w-4" /> PRD
        </button>
        <button
          onClick={() => setActiveTab("struktur")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "struktur" ? "bg-signal text-ink" : "text-muted hover:text-paper",
          )}
        >
          <FolderTree className="h-4 w-4" /> Struktur Program
        </button>
      </div>

      {activeTab === "prd" && (
        <div className="rounded-xl border border-line bg-ink-raised p-8 print-content">
          {isEditing ? (
            <textarea
              value={editedPrd}
              onChange={(e) => handleEditChange(e.target.value)}
              className="w-full min-h-[500px] border-none bg-transparent text-paper font-mono text-sm leading-relaxed focus:outline-none"
              placeholder="Tulis PRD dalam format Markdown..."
            />
          ) : (
            <article className="prose prose-invert prose-ideforge max-w-none prose-headings:font-display">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.prd}</ReactMarkdown>
            </article>
          )}
        </div>
      )}

      {activeTab === "struktur" && (
        <div className="rounded-xl border border-line bg-ink-raised p-8 print-content">
          {plan.folderStructure ? (
            <article className="prose prose-invert prose-ideforge max-w-none prose-headings:font-display">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.folderStructure}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-sm text-muted text-center py-12">
              Folder structure will be generated automatically after PRD creation. Regenerate PRD to create it.
            </p>
          )}
        </div>
      )}

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
