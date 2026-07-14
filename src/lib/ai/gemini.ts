/**
 * Minimal client for Google's Gemini API (generateContent), used because it has
 * a genuinely free tier (Google AI Studio → aistudio.google.com/apikey) and
 * native support for constrained JSON output via responseSchema, which is what
 * every generation step in this app needs (questions, structure, PRD, tasks).
 */

/**
 * Google retires Gemini models fairly aggressively (sometimes ahead of their
 * own published shutdown dates). Instead of hardcoding one model, we try a
 * list in order and fall through to the next on a 404/"no longer available"
 * response. GEMINI_MODEL (if set) is tried first.
 */
import { incrementUsage } from "@/lib/db/usage";

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-3-flash-preview",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
].filter((m): m is string => Boolean(m));

function apiUrlFor(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

function getApiKey(customKey?: string | null): string {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY belum di-set. Ambil API key gratis di https://aistudio.google.com/apikey lalu masukkan ke file .env.local atau masukkan di UI.",
    );
  }
  return key;
}

interface GenerateOptions {
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  apiKey?: string | null;
  model?: string;
}

async function callGemini(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const apiKey = getApiKey(opts.apiKey);

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.responseSchema
        ? { responseMimeType: "application/json", responseSchema: opts.responseSchema }
        : {}),
    },
  };

  if (opts.systemInstruction) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }

  const modelsToTry = opts.model ? [opts.model] : MODEL_CANDIDATES;
  let lastRetiredModel: string | null = null;

  for (const model of modelsToTry) {
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      const res = await fetch(apiUrlFor(model), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          const blockReason = data?.promptFeedback?.blockReason;
          throw new GeminiRequestError(
            blockReason
              ? `Gemini menolak permintaan ini: ${blockReason}`
              : "Gemini tidak mengembalikan konten. Coba lagi.",
          );
        }

        incrementUsage().catch(() => {});
        return text;
      }

      const errText = await res.text().catch(() => "");
      const isRetired = res.status === 404 || /no longer available/i.test(errText);

      if (isRetired) {
        lastRetiredModel = model;
        break; // try the next candidate
      }

      // Retry on rate-limit (429) or overload (503)
      if ((res.status === 429 || res.status === 503) && attempt < maxAttempts) {
        const delay = Math.min(1000 * 2 ** attempt, 8000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new GeminiRequestError(`Gemini API error (${res.status}): ${errText || res.statusText}`);
    }
  }

  throw new GeminiRequestError(
    `Semua model di daftar (${MODEL_CANDIDATES.join(", ")}) sudah tidak tersedia` +
      (lastRetiredModel ? ` (terakhir dicoba: "${lastRetiredModel}")` : "") +
      `. Cek model aktif terbaru di https://ai.google.dev/gemini-api/docs/models lalu set env GEMINI_MODEL.`,
  );
}

/** Calls Gemini and parses the response as JSON matching type T. */
export async function generateJSON<T>(
  prompt: string,
  responseSchema: Record<string, unknown>,
  systemInstruction?: string,
  apiKey?: string | null,
  model?: string,
): Promise<T> {
  const raw = await callGemini(prompt, { responseSchema, systemInstruction, apiKey, model });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Fallback: strip stray markdown fences some models still add
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

/** Calls Gemini for free-form text (used for the final compiled prompt). */
export async function generateText(
  prompt: string,
  systemInstruction?: string,
  apiKey?: string | null,
  model?: string,
): Promise<string> {
  return callGemini(prompt, { systemInstruction, temperature: 0.7, apiKey, model });
}
