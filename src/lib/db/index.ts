import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbUrl = process.env.TURSO_DATABASE_URL;
const isVercel = process.env.VERCEL === "1";

if (isVercel && !dbUrl) {
  console.error(
    "[ideforge] VERCEL terdeteksi tapi TURSO_DATABASE_URL tidak di-set. " +
    "Buat database Turso gratis di https://turso.tech lalu set env di Vercel dashboard."
  );
}

export const client = createClient({
  url: dbUrl || "file:ideforge.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

async function initDb() {
  await client.execute("PRAGMA busy_timeout = 5000");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      idea_text TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'id',
      tech_mode TEXT,
      tech_choice TEXT,
      questions TEXT,
      answers TEXT,
      structure TEXT,
      prd TEXT,
      tasks TEXT,
      landing_options TEXT,
      selected_landing_id TEXT,
      final_prompt TEXT,
      current_step TEXT NOT NULL DEFAULT 'idea',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  try { await client.execute("ALTER TABLE plans ADD COLUMN landing_options TEXT"); } catch {}
  try { await client.execute("ALTER TABLE plans ADD COLUMN selected_landing_id TEXT"); } catch {}
  try { await client.execute("ALTER TABLE plans ADD COLUMN user_email TEXT"); } catch {}
  await client.execute(`
    CREATE TABLE IF NOT EXISTS gemini_usage (
      date TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      device_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (device_id, key)
    );
  `);
}

initDb().catch(console.error);
