import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateJSON, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { techRecommendationSchema } from "@/lib/ai/schemas";
import { techRecommendationPrompt } from "@/lib/ai/prompts";
import type { TechChoice } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const mode: "ai" | "manual" = body?.mode;

  let techChoice: TechChoice;

  if (mode === "ai") {
    try {
      const apiKey = req.headers.get("x-gemini-api-key") || null;
      const { system, prompt } = techRecommendationPrompt(plan.ideaText, plan.language || "id");
      techChoice = await generateJSON<TechChoice>(prompt, techRecommendationSchema, system, apiKey);
    } catch (err) {
      if (err instanceof GeminiConfigError) {
        return NextResponse.json({ error: err.message }, { status: 412 });
      }
      if (err instanceof GeminiRequestError) {
        return NextResponse.json({ error: err.message }, { status: 502 });
      }
      return NextResponse.json({ error: "Gagal minta rekomendasi AI." }, { status: 500 });
    }
  } else {
    const choice = body?.choice;
    if (!choice?.frontend || !choice?.backend || !choice?.database) {
      return NextResponse.json(
        { error: "Lengkapi pilihan frontend, backend, dan database." },
        { status: 400 },
      );
    }
    techChoice = choice;
  }

  const updated = await updatePlan(id, {
    techMode: mode,
    techChoice,
    currentStep: "questions",
  });

  return NextResponse.json({ plan: updated });
}
