"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit3, Check, X, Loader2, RotateCw } from "lucide-react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { StructureFlow } from "@/components/structure/structure-flow";
import { StepNav } from "@/components/step-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export default function StructurePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/plans/${id}/structure`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setPlan(data.plan);
      })
      .catch(() => !cancelled && setError("Gagal memuat struktur."));
    return () => {
      cancelled = true;
    };
  }, [id]);

  function startEditing() {
    setEditName(plan?.structure?.appName || "");
    setEditSummary(plan?.structure?.summary || "");
    setEditing(true);
  }

  async function saveName() {
    if (!editName.trim() || !plan) return;
    setSavingName(true);
    try {
      const res = await apiFetch(`/api/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: editName.trim(), summary: editSummary.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      setPlan(data.plan);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSavingName(false);
    }
  }

  async function goToPrd() {
    setAdvancing(true);
    router.push(`/plans/${id}/prd`);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
        <button
          onClick={() => {
            setError(null);
            apiFetch(`/api/plans/${id}/structure`)
              .then((r) => r.json())
              .then((data) => {
                if (data.error) setError(data.error);
                else setPlan(data.plan);
              })
              .catch(() => setError("Gagal memuat struktur."));
          }}
          className="mt-4 flex items-center gap-1.5 rounded border border-line px-4 py-2 text-xs font-mono text-muted transition-colors hover:border-signal/40 hover:text-paper"
        >
          <RotateCw className="h-3.5 w-3.5" /> Coba Lagi
        </button>
      </div>
    );
  }

  if (!plan?.structure) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        {editing ? (
          <div className="flex flex-col gap-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xl font-bold font-display"
              placeholder="Nama aplikasi"
            />
            <Input
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="text-sm"
              placeholder="Ringkasan singkat"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveName} disabled={savingName}>
                {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Simpan
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" /> Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="group flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-paper">{plan.structure.appName}</h1>
              <p className="mt-1 text-sm text-muted">{plan.structure.summary}</p>
            </div>
            <button
              onClick={startEditing}
              className="mt-1 shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition-opacity hover:bg-ink-raised-2 hover:text-paper group-hover:opacity-100"
              title="Edit name & summary"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <StructureFlow structure={plan.structure} />

      <StepNav
        nextLabel="Lanjut ke PRD"
        nextLoading={advancing}
        onNext={goToPrd}
      />
    </div>
  );
}
