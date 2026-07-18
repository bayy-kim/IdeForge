import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateJSON, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { questionsSchema } from "@/lib/ai/schemas";
import { clarifyingQuestionsPrompt } from "@/lib/ai/prompts";
import { checkPlanOwnership, resolveAIConfig } from "@/app/api/auth-utils";
import { aiRateLimit } from "@/lib/rate-limit";
import type { ClarifyingQuestion } from "@/lib/types";

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

  if (plan.questions && plan.questions.length > 0) {
    return NextResponse.json({ plan });
  }

  try {
    const aiConfig = await resolveAIConfig(req);
    const { system, prompt } = clarifyingQuestionsPrompt(plan.ideaText, plan.techChoice, plan.language || "id");
    const result = await generateJSON<{ questions: ClarifyingQuestion[] }>(
      prompt,
      questionsSchema,
      system,
      null,
      undefined,
      aiConfig,
    );
    const finalQuestions = [
      ...(result.questions || []),
      {
        id: "additional_requests",
        question: plan.language === "en"
          ? "Are there any other features or additions you would like to include?"
          : "Apakah ada fitur atau tambahan lain yang ingin ditanyakan / ditambahkan?",
        type: "text" as const,
        required: false,
      },
    ];

    const updated = await updatePlan(id, { questions: finalQuestions });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat pertanyaan." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan." }, { status: 404 });
  }

  const ownershipError = await checkPlanOwnership(plan);
  if (ownershipError) return ownershipError;

  const body = await req.json().catch(() => null);
  const answers = body?.answers;
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "Jawaban tidak valid." }, { status: 400 });
  }

  const updated = await updatePlan(id, {
    answers,
    currentStep: "structure",
  });

  return NextResponse.json({ plan: updated });
}
