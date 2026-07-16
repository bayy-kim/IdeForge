import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import type {
  TechChoice,
  ClarifyingQuestion,
  ClarifyingAnswer,
  PlanStructure,
  PlanTask,
  PlanStep,
  TechMode,
  LandingOption,
} from "@/lib/types";

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  ideaText: text("idea_text").notNull(),
  language: text("language").notNull().default("id"),
  techMode: text("tech_mode").$type<TechMode | null>(),
  techChoice: text("tech_choice", { mode: "json" }).$type<TechChoice | null>(),
  questions: text("questions", { mode: "json" }).$type<ClarifyingQuestion[] | null>(),
  answers: text("answers", { mode: "json" }).$type<ClarifyingAnswer[] | null>(),
  structure: text("structure", { mode: "json" }).$type<PlanStructure | null>(),
  prd: text("prd"),
  srs: text("srs"),
  folderStructure: text("folder_structure"),
  tasks: text("tasks", { mode: "json" }).$type<PlanTask[] | null>(),
  landingOptions: text("landing_options", { mode: "json" }).$type<LandingOption[] | null>(),
  selectedLandingId: text("selected_landing_id"),
  finalPrompt: text("final_prompt"),
  requiredSkills: text("required_skills"),
  currentStep: text("current_step").$type<PlanStep>().notNull().default("idea"),
  userEmail: text("user_email"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type PlanRow = typeof plans.$inferSelect;
export type NewPlanRow = typeof plans.$inferInsert;

export const settings = sqliteTable("settings", {
  deviceId: text("device_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});
