"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { StructureFlow } from "@/components/structure/structure-flow";
import { StepNav } from "@/components/step-nav";
import type { Plan } from "@/lib/types";

export default function StructurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/plans/${id}/structure`)
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

  async function goToPrd() {
    setAdvancing(true);
    router.push(`/plans/${id}/prd`);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">{error}</p>
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
        <h1 className="font-display text-2xl font-bold text-paper">{plan.structure.appName}</h1>
        <p className="mt-1 text-sm text-muted">{plan.structure.summary}</p>
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
