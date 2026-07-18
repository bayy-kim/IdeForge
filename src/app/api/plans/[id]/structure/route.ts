import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateJSON, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { structureSchema } from "@/lib/ai/schemas";
import { structurePrompt } from "@/lib/ai/prompts";
import { checkPlanOwnership, resolveAIConfig } from "@/app/api/auth-utils";
import { aiRateLimit } from "@/lib/rate-limit";
import type { PlanStructure, FeatureNode } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rateLimitError = await aiRateLimit(req);
  if (rateLimitError) return rateLimitError;

  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const ownershipError = await checkPlanOwnership(plan);
  if (ownershipError) return ownershipError;

  if (plan.structure) {
    return NextResponse.json({ plan });
  }

  try {
    const aiConfig = await resolveAIConfig(req);
    const { system, prompt } = structurePrompt(plan.ideaText, plan.techChoice, plan.answers || [], plan.language || "id");
    const raw = await generateJSON<{
      appName: string;
      summary: string;
      features: Omit<FeatureNode, "status">[];
    }>(prompt, structureSchema, system, null, undefined, aiConfig);

    const structure: PlanStructure = {
      appName: raw.appName,
      summary: raw.summary,
      features: raw.features.map((f) => ({ ...f, status: "Direncanakan" as const })),
    };

    const updated = await updatePlan(id, { structure, currentStep: "prd" });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat struktur." }, { status: 500 });
  }
}
