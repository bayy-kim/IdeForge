/**
 * Minimal client for Google's Gemini API (generateContent), used because it has
 * a genuinely free tier (Google AI Studio → aistudio.google.com/apikey) and
 * native support for constrained JSON output via responseSchema, which is what
 * every generation step in this app needs (questions, structure, PRD, tasks).
 */

/**
 * Google retires Gemini models fairly aggressively, and free-tier daily quotas
 * for newer/preview models can be very small (sometimes as low as ~20/day).
 * Instead of hardcoding one model, we try a list in order and fall through to
 * the next candidate on either a 404 ("no longer available") or a 429 (quota
 * exceeded) response. GEMINI_MODEL (if set) is tried first.
 */
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter((m): m is string => Boolean(m));

const REQUEST_TIMEOUT_MS = 25_000;

function apiUrlFor(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY belum di-set. Ambil API key gratis di https://aistudio.google.com/apikey lalu masukkan ke file .env.local",
    );
  }
  return key;
}

interface GenerateOptions {
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

async function callGemini(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const apiKey = getApiKey();

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

  let lastFailedModel: string | null = null;
  let lastFailReason: "retired" | "quota" | "timeout" | null = null;

  for (const model of MODEL_CANDIDATES) {
    let res: Response;
    try {
      res = await fetchWithTimeout(apiUrlFor(model), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Timed out or network-level failure — don't burn the whole function
      // budget on one slow/hanging model, just try the next candidate.
      lastFailedModel = model;
      lastFailReason = "timeout";
      if (err instanceof Error && err.name === "AbortError") {
        continue;
      }
      throw new GeminiRequestError(
        `Gagal menghubungi Gemini API (model "${model}"): ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      const isRetired = res.status === 404 || /no longer available/i.test(errText);
      const isQuotaExceeded = res.status === 429;

      if (isRetired || isQuotaExceeded) {
        lastFailedModel = model;
        lastFailReason = isRetired ? "retired" : "quota";
        continue; // try the next candidate in the list
      }

      throw new GeminiRequestError(`Gemini API error (${res.status}): ${errText || res.statusText}`);
    }

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

    return text;
  }

  const reasonText =
    lastFailReason === "quota"
      ? `semua model di daftar sudah kena limit kuota harian gratis (terakhir dicoba: "${lastFailedModel}"). Kuota reset tiap tengah malam waktu Pasifik (sekitar siang/sore WIB) — coba lagi nanti, atau upgrade ke paid tier kalau butuh kuota lebih besar sekarang`
      : lastFailReason === "timeout"
        ? `semua model di daftar timeout atau gagal dihubungi (terakhir dicoba: "${lastFailedModel}", batas ${REQUEST_TIMEOUT_MS / 1000}s per model). Kemungkinan Gemini API sedang lambat/gangguan — coba lagi sebentar lagi`
        : `semua model di daftar (${MODEL_CANDIDATES.join(", ")}) sudah tidak tersedia` +
          (lastFailedModel ? ` (terakhir dicoba: "${lastFailedModel}")` : "");

  throw new GeminiRequestError(
    `Gemini API gagal: ${reasonText}. Cek model aktif & kuota di https://ai.google.dev/gemini-api/docs/models lalu set env GEMINI_MODEL kalau perlu.`,
  );
}

/** Calls Gemini and parses the response as JSON matching type T. */
export async function generateJSON<T>(
  prompt: string,
  responseSchema: Record<string, unknown>,
  systemInstruction?: string,
): Promise<T> {
  const raw = await callGemini(prompt, { responseSchema, systemInstruction });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Fallback: strip stray markdown fences some models still add
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

/** Calls Gemini for free-form text (used for the final compiled prompt). */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  return callGemini(prompt, { systemInstruction, temperature: 0.7 });
}
