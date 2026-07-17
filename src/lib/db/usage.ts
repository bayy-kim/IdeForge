import { client } from "./index";

/**
 * Per-model daily usage tracking.
 *
 * Limits are based on known Gemini free-tier quotas:
 *  - Flash / freeTier models : 1500 req/day
 *  - Pro / billing models    :  500 req/day (stricter for free-tier users)
 *  - Unknown model           : 1500 req/day (conservative default)
 */
const PER_MODEL_LIMITS: Record<string, number> = {
  "gemini-2.0-flash": 1500,
  "gemini-2.5-flash": 1500,
  "gemini-2.5-flash-lite": 1500,
  "gemini-3.1-flash-lite": 1500,
  "gemini-3.1-flash-lite-preview": 1500,
  "gemini-3.5-flash": 1500,
  "gemini-3-flash-preview": 1500,
  "gemini-2.5-pro": 500,
  "gemini-3.1-pro-preview": 500,
  "gemini-3-pro-preview": 500,
};

const CALLS_PER_PLAN = 7;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getModelLimit(model: string): number {
  return PER_MODEL_LIMITS[model] ?? 1500;
}

export async function getTodayUsage(model?: string): Promise<number> {
  try {
    if (model) {
      const rs = await client.execute({
        sql: "SELECT count FROM model_usage WHERE date = ? AND model = ?",
        args: [today(), model],
      });
      return Number(rs.rows[0]?.count) || 0;
    }
    // Fallback: sum all models for total
    const rs = await client.execute({
      sql: "SELECT COALESCE(SUM(count), 0) AS total FROM model_usage WHERE date = ?",
      args: [today()],
    });
    return Number(rs.rows[0]?.total) || 0;
  } catch {
    return 0;
  }
}

export async function incrementUsage(model?: string): Promise<void> {
  const m = model || "unknown";
  const d = today();
  try {
    await client.execute({
      sql: `INSERT INTO model_usage (date, model, count) VALUES (?, ?, 1)
            ON CONFLICT (date, model) DO UPDATE SET count = count + 1`,
      args: [d, m],
    });
  } catch {}
}

export async function estimateRemainingPlans(model?: string): Promise<number> {
  const limit = model ? getModelLimit(model) : 1500;
  const used = await getTodayUsage(model);
  return Math.max(0, Math.floor((limit - used) / CALLS_PER_PLAN));
}

/** Returns detailed per-model usage for the current day. */
export async function getPerModelUsage(): Promise<Record<string, { used: number; limit: number; remaining: number }>> {
  try {
    const rs = await client.execute({
      sql: "SELECT model, count FROM model_usage WHERE date = ?",
      args: [today()],
    });
    const usage: Record<string, number> = {};
    for (const row of rs.rows) {
      usage[String(row.model)] = Number(row.count);
    }
    const result: Record<string, { used: number; limit: number; remaining: number }> = {};
    for (const [m, used] of Object.entries(usage)) {
      const limit = getModelLimit(m);
      result[m] = { used, limit, remaining: Math.max(0, limit - used) };
    }
    return result;
  } catch {
    return {};
  }
}
