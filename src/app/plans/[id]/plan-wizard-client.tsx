"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuantumPulseLoader } from "@/components/ui/quantum-pulse-loader";
import { TechStep } from "@/components/steps/tech-step";
import { QuestionsStep } from "@/components/steps/questions-step";
import { apiFetch } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export function PlanWizardClient({ planId }: { planId: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(async () => {
    const res = await apiFetch(`/api/plans/${planId}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    const data = await res.json();
    setPlan(data.plan);

    if (data.plan.currentStep === "structure") {
      router.replace(`/plans/${planId}/structure`);
    } else if (data.plan.currentStep === "prd") {
      router.replace(`/plans/${planId}/prd`);
    } else if (data.plan.currentStep === "landing") {
      router.replace(`/plans/${planId}/landing`);
    } else if (data.plan.currentStep === "tasks") {
      router.replace(`/plans/${planId}/tasks`);
    } else if (data.plan.currentStep === "prompt") {
      router.replace(`/plans/${planId}/prompt`);
    }
  }, [planId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    refetch();
  }, [refetch]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-sm text-danger">Plan tidak ditemukan.</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-6 py-24">
        <QuantumPulseLoader />
      </div>
    );
  }

  if (plan.currentStep === "tech") {
    return <TechStep planId={planId} onDone={refetch} />;
  }

  if (plan.currentStep === "questions") {
    return <QuestionsStep planId={planId} onDone={refetch} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl justify-center px-6 py-24">
      <QuantumPulseLoader />
    </div>
  );
}
