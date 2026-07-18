/**
 * Centralized Gemini model registry — single source of truth.
 * All available text-generation Gemini models, ordered by preference.
 */

export interface ModelOption {
  id: string;
  label: string;
  /** true if this model is known to work on free tier (no billing required) */
  freeTier: boolean;
}

/**
 * All Gemini text-generation models ordered newest→oldest.
 * Used by gemini.ts as automatic fallback chain.
 */
// Terverifikasi 18 Jul 2026 lewat fitur "Cek Semua Model": lihat urutan prioritas di bawah.
export const ALL_GEMINI_MODELS: string[] = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-flash-lite-latest",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
].filter((m): m is string => Boolean(m));

/**
 * Usable model fallback candidates (stable+latest aliases removed to avoid duplicates).
 * Used as server-side fallback when no user model selected.
 */
export const GEMINI_MODEL_CANDIDATES = ALL_GEMINI_MODELS;

/**
 * Models shown in UI selectors (manageable list, most relevant).
 * Ordered: newest/strongest first, then stable, then lighter.
 */
export const SELECTABLE_MODELS: ModelOption[] = [
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash (Terbaru)", freeTier: true },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview", freeTier: true },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", freeTier: true },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", freeTier: true },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", freeTier: false },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", freeTier: false },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", freeTier: true },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", freeTier: true },
];

/** Only free-tier models for users without billing. */
export const FREE_TIER_MODELS = SELECTABLE_MODELS.filter((m) => m.freeTier);

/** Default model when none selected (safe free-tier default). */
export const DEFAULT_MODEL = "gemini-3.5-flash";