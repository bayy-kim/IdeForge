import { client } from "./index";

const ESTIMATED_DAILY_LIMIT = 1500;
const CALLS_PER_PLAN = 7;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayUsage(): Promise<number> {
  try {
    const rs = await client.execute({
      sql: "SELECT count FROM gemini_usage WHERE date = ?",
      args: [today()],
    });
    return Number(rs.rows[0]?.count) || 0;
  } catch {
    return 0;
  }
}

export async function incrementUsage(): Promise<void> {
  const d = today();
  try {
    await client.execute({
      sql: `INSERT INTO gemini_usage (date, count) VALUES (?, 1)
            ON CONFLICT (date) DO UPDATE SET count = count + 1`,
      args: [d],
    });
  } catch {}
}

export async function estimateRemainingPlans(): Promise<number> {
  const used = await getTodayUsage();
  return Math.max(0, Math.floor((ESTIMATED_DAILY_LIMIT - used) / CALLS_PER_PLAN));
}
