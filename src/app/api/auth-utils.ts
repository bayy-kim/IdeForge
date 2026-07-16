/**
 * Shared API utilities:
 * - checkPlanOwnership: validate a user can access a plan
 * - resolveAIConfig: determine AI provider/key/url from request headers or DB settings
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSettings } from "@/lib/db/repo";
import type { Plan } from "@/lib/types";
import type { AIConfig, AIProvider } from "@/lib/ai/gemini";

// ─── Plan Ownership ────────────────────────────────────────────────────────────

/**
 * Returns null if user is authorized, or a NextResponse with error if not.
 * Rules:
 *  - If plan has no owner (userEmail null), anyone can access.
 *  - If plan has an owner, only that user (matched by session email) can access.
 *  - If plan has an owner but request is unauthenticated → 401.
 *  - If plan has an owner but email doesn't match → 404 (privacy: don't reveal existence).
 */
export async function checkPlanOwnership(
  plan: Plan,
): Promise<NextResponse | null> {
  if (!plan.userEmail) {
    // Public / anonymous plan — accessible by anyone
    return null;
  }

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json(
      { error: "Login dulu untuk mengakses plan ini." },
      { status: 401 },
    );
  }

  if (plan.userEmail !== userEmail) {
    return NextResponse.json(
      { error: "Plan tidak ditemukan." },
      { status: 404 },
    );
  }

  return null;
}

// ─── AI Config Resolution ──────────────────────────────────────────────────────

/**
 * Resolves the AI configuration to use for a given request.
 * Priority:
 *  1. Request headers (x-gemini-api-key, x-ai-provider, x-ai-api-url)
 *  2. User settings from DB (looked up by session email)
 *  3. Server-side environment variables (GEMINI_API_KEY)
 */
export async function resolveAIConfig(req: NextRequest): Promise<AIConfig> {
  // 1. Try request headers (client-injected via apiFetch / localStorage)
  const headerKey = req.headers.get("x-gemini-api-key") || null;
  const headerProvider = req.headers.get("x-ai-provider") as AIProvider | null;
  const headerUrl = req.headers.get("x-ai-api-url") || null;

  if (headerKey || headerProvider) {
    return {
      provider: headerProvider || "gemini",
      apiKey: headerKey,
      apiUrl: headerUrl,
    };
  }

  // 2. Try user settings from DB
  try {
    const session = await auth();
    const lookupId = session?.user?.email || null;
    if (lookupId) {
      const userSettings = await getUserSettings(lookupId);
      const provider = (userSettings["ai_provider"] as AIProvider) || "gemini";
      const apiKey = userSettings["ai_api_key"] || null;
      const apiUrl = userSettings["ai_api_url"] || null;

      if (apiKey) {
        return { provider, apiKey, apiUrl };
      }
    }
  } catch {
    // DB not ready or no session — fall through to env
  }

  // 3. Fall back to server env GEMINI_API_KEY (Gemini only)
  return {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY || null,
    apiUrl: null,
  };
}
