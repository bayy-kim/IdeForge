import { eq } from "drizzle-orm";
import { db, dbReady } from "./index";
import { plans, settings, type PlanRow } from "./schema";
import type { Plan } from "@/lib/types";

function genId(): string {
  return `pln_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    ideaText: row.ideaText,
    language: row.language,
    techMode: row.techMode,
    techChoice: row.techChoice,
    questions: row.questions,
    answers: row.answers,
    structure: row.structure,
    prd: row.prd,
    srs: row.srs,
    folderStructure: row.folderStructure,
    tasks: row.tasks,
    landingOptions: row.landingOptions,
    selectedLandingId: row.selectedLandingId,
    finalPrompt: row.finalPrompt,
    requiredSkills: row.requiredSkills,
    currentStep: row.currentStep,
    userEmail: row.userEmail,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createPlan(ideaText: string, language: string, userEmail?: string | null): Promise<Plan> {
  await dbReady();
  const now = new Date().toISOString();
  const row: typeof plans.$inferInsert = {
    id: genId(),
    ideaText,
    language,
    userEmail: userEmail || null,
    currentStep: "tech",
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(plans).values(row).run();
  return rowToPlan({ ...row, techMode: null, techChoice: null, questions: null, answers: null, structure: null, prd: null, folderStructure: null, tasks: null, landingOptions: null, selectedLandingId: null, finalPrompt: null, requiredSkills: null } as PlanRow);
}

export async function getPlan(id: string): Promise<Plan | null> {
  await dbReady();
  const row = await db.select().from(plans).where(eq(plans.id, id)).get();
  return row ? rowToPlan(row) : null;
}

export async function listPlansByUser(userEmail: string): Promise<Plan[]> {
  await dbReady();
  const rows = await db.select().from(plans).where(eq(plans.userEmail, userEmail)).all();
  return rows
    .map(rowToPlan)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listPlans(): Promise<Plan[]> {
  await dbReady();
  const rows = await db.select().from(plans).all();
  return rows
    .map(rowToPlan)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updatePlan(id: string, patch: Partial<Omit<PlanRow, "id" | "createdAt">>): Promise<Plan | null> {
  await dbReady();
  const now = new Date().toISOString();
  await db.update(plans)
    .set({ ...patch, updatedAt: now })
    .where(eq(plans.id, id))
    .run();
  return getPlan(id);
}

export async function deletePlan(id: string): Promise<boolean> {
  await dbReady();
  const res = await db.delete(plans).where(eq(plans.id, id)).run();
  return res.rowsAffected > 0;
}

export async function getUserSettings(deviceIdOrEmail: string): Promise<Record<string, string>> {
  await dbReady();
  const rows = await db.select().from(settings).where(eq(settings.deviceId, deviceIdOrEmail)).all();
  const res: Record<string, string> = {};
  for (const r of rows) {
    res[r.key] = r.value;
  }
  return res;
}
