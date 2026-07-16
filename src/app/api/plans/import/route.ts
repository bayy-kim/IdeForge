import { NextRequest, NextResponse } from "next/server";
import { createPlan, updatePlan } from "@/lib/db/repo";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imported = body?.plan;

    if (!imported || !imported.ideaText) {
      return NextResponse.json(
        { error: "Data plan tidak valid. Pastikan file JSON memiliki field 'ideaText'." },
        { status: 400 },
      );
    }

    // FIXED: Associate the importing user's email so the plan appears in their history
    const session = await auth();
    const userEmail = session?.user?.email ?? null;

    const plan = await createPlan(imported.ideaText, imported.language || "id");

    const patch: Record<string, unknown> = {
      // Attach owner
      userEmail,
    };
    if (imported.techMode) patch.techMode = imported.techMode;
    if (imported.techChoice) patch.techChoice = imported.techChoice;
    if (imported.questions) patch.questions = imported.questions;
    if (imported.answers) patch.answers = imported.answers;
    if (imported.structure) patch.structure = imported.structure;
    if (imported.prd) patch.prd = imported.prd;
    if (imported.srs) patch.srs = imported.srs;
    if (imported.tasks) patch.tasks = imported.tasks;
    if (imported.landingOptions) patch.landingOptions = imported.landingOptions;
    if (imported.selectedLandingId) patch.selectedLandingId = imported.selectedLandingId;
    if (imported.finalPrompt) patch.finalPrompt = imported.finalPrompt;
    if (imported.currentStep) patch.currentStep = imported.currentStep;

    const updated = await updatePlan(plan.id, patch as Parameters<typeof updatePlan>[1]);
    return NextResponse.json({ plan: updated });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengimpor plan. Pastikan file JSON valid." },
      { status: 400 },
    );
  }
}
