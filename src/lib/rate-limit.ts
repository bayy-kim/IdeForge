import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/db/index";
import { resolveAIConfig } from "@/app/api/auth-utils";

/**
 * Check rate limit for a given identifier within a time window.
 * Uses atomic UPSERT on the `rate_limits` table (same pattern as model_usage).
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMinutes: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = windowMinutes * 60_000;
  const windowStart = new Date(
    Math.floor(Date.now() / windowMs) * windowMs,
  ).toISOString();

  try {
    await client.execute({
      sql: `INSERT INTO rate_limits (identifier, window_start, count) VALUES (?, ?, 1)
            ON CONFLICT (identifier, window_start) DO UPDATE SET count = count + 1`,
      args: [identifier, windowStart],
    });

    const row = await client.execute({
      sql: `SELECT count FROM rate_limits WHERE identifier = ? AND window_start = ?`,
      args: [identifier, windowStart],
    });

    const count = Number(row.rows[0]?.count ?? 0);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    // If rate limit check fails, allow the request (fail-open)
    return { allowed: true, remaining: limit };
  }
}

/** Extract client IP from request headers (Vercel sets x-forwarded-for). */
export function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Rate limit response returned when limit is exceeded. */
export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Terlalu banyak request dari IP ini, coba lagi dalam beberapa menit." },
    { status: 429 },
  );
}

/**
 * Check if the user is using their own API key (not the server's).
 * If they have their own key, they should be exempt from rate limiting.
 */
export async function usesOwnApiKey(req: NextRequest): Promise<boolean> {
  try {
    const config = await resolveAIConfig(req);
    const serverKey = process.env.GEMINI_API_KEY || "";
    // User has own key if config.apiKey exists and differs from the server key
    return !!config.apiKey && config.apiKey !== serverKey;
  } catch {
    return false;
  }
}

/**
 * Convenience: run the full rate limit guard for AI routes.
 * Returns null if allowed, or a 429 NextResponse if blocked.
 */
export async function aiRateLimit(req: NextRequest): Promise<NextResponse | null> {
  if (await usesOwnApiKey(req)) return null;
  const ip = getClientIP(req);
  const { allowed } = await checkRateLimit(ip, 20, 10);
  if (!allowed) return rateLimitResponse();
  return null;
}

/**
 * Convenience: run the full rate limit guard for plan creation (POST /api/plans).
 * More lenient limit since no AI call is made.
 */
export async function createPlanRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIP(req);
  const { allowed } = await checkRateLimit(ip, 10, 10);
  if (!allowed) return rateLimitResponse();
  return null;
}
