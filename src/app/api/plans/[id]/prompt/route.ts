import { NextRequest, NextResponse } from "next/server";
import { getPlan, updatePlan } from "@/lib/db/repo";
import { generateText, GeminiConfigError, GeminiRequestError } from "@/lib/ai/gemini";
import { finalPromptCompilePrompt, requiredSkillsPrompt } from "@/lib/ai/prompts";
import { checkPlanOwnership, resolveAIConfig } from "@/app/api/auth-utils";

export async function GET(
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

  const searchParams = req.nextUrl.searchParams;
  const regenerate = searchParams.get("regenerate") === "true";

  if (plan.finalPrompt && !regenerate) {
    return NextResponse.json({ plan });
  }

  if (!plan.structure || !plan.prd) {
    return NextResponse.json(
      { error: "Selesaikan langkah PRD terlebih dahulu." },
      { status: 400 },
    );
  }

  try {
    const aiConfig = await resolveAIConfig(req);
    const landingStyle = plan.landingOptions?.find((o) => o.id === plan.selectedLandingId) || null;

    const { system, prompt } = finalPromptCompilePrompt(
      plan.structure,
      plan.techChoice,
      plan.prd,
      plan.tasks?.length || 0,
      landingStyle,
      plan.language || "id",
    );
    const finalPrompt = await generateText(prompt, system, null, undefined, aiConfig);

    let requiredSkills: string | null = null;
    try {
      const { system: rsSystem, prompt: rsPrompt } = requiredSkillsPrompt(
        {
          ideaText: plan.ideaText,
          prd: plan.prd,
          folderStructure: plan.folderStructure,
          structure: plan.structure,
        },
        plan.techChoice,
        plan.language || "id",
      );
      requiredSkills = await generateText(rsPrompt, rsSystem, null, undefined, aiConfig);
    } catch {
      requiredSkills = null;
    }

    const updated = await updatePlan(id, {
      finalPrompt,
      requiredSkills: requiredSkills ?? undefined,
      currentStep: "prompt",
    });
    return NextResponse.json({ plan: updated });
  } catch (err) {
    if (err instanceof GeminiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat prompt akhir." }, { status: 500 });
  }
}
