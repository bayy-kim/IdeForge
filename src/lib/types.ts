export type TechMode = "ai" | "manual";

export interface TechChoice {
  frontend: string;
  backend: string;
  database: string;
  extras?: string[];
  reasoning?: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: "text" | "choice";
  options?: string[];
  allowCustom?: boolean;
  required: boolean;
}

export interface ClarifyingAnswer {
  questionId: string;
  question: string;
  answer: string;
  skipped: boolean;
}

export interface SubFeature {
  id: string;
  name: string;
}

export interface FeatureNode {
  id: string;
  name: string;
  phase: number;
  status: "Direncanakan" | "Berjalan" | "Selesai";
  subFeatures: SubFeature[];
}

export interface PlanStructure {
  appName: string;
  summary: string;
  features: FeatureNode[];
}

export interface PlanTask {
  id: string;
  featureId: string;
  featureName: string;
  phase: number;
  title: string;
  description: string;
  done: boolean;
}

export type PlanStep =
  | "idea"
  | "tech"
  | "questions"
  | "structure"
  | "prd"
  | "landing"
  | "tasks"
  | "prompt";

export interface LandingOption {
  id: string;
  styleName: string;
  styleDescription: string;
  html: string;
}

export interface Plan {
  id: string;
  ideaText: string;
  language: string;
  techMode: TechMode | null;
  techChoice: TechChoice | null;
  questions: ClarifyingQuestion[] | null;
  answers: ClarifyingAnswer[] | null;
  structure: PlanStructure | null;
  prd: string | null;
  tasks: PlanTask[] | null;
  landingOptions: LandingOption[] | null;
  selectedLandingId: string | null;
  finalPrompt: string | null;
  userEmail: string | null;
  currentStep: PlanStep;
  createdAt: string;
  updatedAt: string;
}
