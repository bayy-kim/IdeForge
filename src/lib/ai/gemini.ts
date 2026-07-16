/**
 * Multi-provider AI engine for IdeForge.
 * Supports:
 *  - Google Gemini (default) — native responseSchema JSON output
 *  - Anthropic Claude        — via /v1/messages, JSON output via prompt engineering
 *  - Custom / OpenAI-compat  — via /v1/chat/completions, JSON output via prompt engineering
 */

import { incrementUsage } from "@/lib/db/usage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProvider = "gemini" | "claude" | "custom";

export interface AIConfig {
  provider?: AIProvider;
  apiKey?: string | null;
  apiUrl?: string | null;
  model?: string;
}

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

// ─── Gemini ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((m): m is string => Boolean(m));

function geminiUrlFor(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function getGeminiKey(customKey?: string | null): string {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY belum di-set. Ambil API key gratis di https://aistudio.google.com/apikey lalu masukkan ke file .env.local atau masukkan di halaman Pengaturan.",
    );
  }
  return key;
}

async function callGemini(
  prompt: string,
  opts: {
    systemInstruction?: string;
    responseSchema?: Record<string, unknown>;
    temperature?: number;
    apiKey?: string | null;
    model?: string;
  } = {},
): Promise<string> {
  const apiKey = getGeminiKey(opts.apiKey);

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

  const modelsToTry = opts.model ? [opts.model] : GEMINI_MODEL_CANDIDATES;
  let lastRetiredModel: string | null = null;

  for (const model of modelsToTry) {
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      const res = await fetch(geminiUrlFor(model), {
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
        break;
      }

      if (res.status === 429 || res.status === 503) {
        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * 2 ** attempt, 8000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        // exhausted retries on this model — try next one
        break;
      }

      throw new GeminiRequestError(`Gemini API error (${res.status}): ${errText || res.statusText}`);
    }
  }

  throw new GeminiRequestError(
    `Semua model Gemini di daftar (${GEMINI_MODEL_CANDIDATES.join(", ")}) sudah tidak tersedia` +
      (lastRetiredModel ? ` (terakhir dicoba: "${lastRetiredModel}")` : "") +
      `. Cek model aktif terbaru di https://ai.google.dev/gemini-api/docs/models lalu set env GEMINI_MODEL.`,
  );
}

// ─── Anthropic Claude ─────────────────────────────────────────────────────────

async function callClaude(
  prompt: string,
  opts: {
    systemInstruction?: string;
    wantJson?: boolean;
    apiKey: string;
    apiUrl?: string | null;
    model?: string;
  },
): Promise<string> {
  const baseUrl = opts.apiUrl?.replace(/\/$/, "") || "https://api.anthropic.com";
  const url = `${baseUrl}/v1/messages`;
  const model = opts.model || "claude-sonnet-4-20250514";

  const systemParts: string[] = [];
  if (opts.systemInstruction) systemParts.push(opts.systemInstruction);
  if (opts.wantJson) {
    systemParts.push(
      "IMPORTANT: Your response MUST be valid JSON only. Do NOT wrap it in markdown code fences. Do NOT add any explanation. Output raw JSON only.",
    );
  }

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        ...(systemParts.length ? { system: systemParts.join("\n\n") } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text: string | undefined = data?.content?.[0]?.text;
      if (!text) throw new GeminiRequestError("Claude tidak mengembalikan konten. Coba lagi.");
      incrementUsage().catch(() => {});
      return text;
    }

    const errText = await res.text().catch(() => "");

    if ((res.status === 429 || res.status === 529) && attempt < maxAttempts) {
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new GeminiConfigError(`API key Claude tidak valid atau tidak memiliki akses (${res.status}).`);
    }

    throw new GeminiRequestError(`Claude API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  throw new GeminiRequestError("Claude API: melebihi batas percobaan (rate limit). Coba lagi nanti.");
}

// ─── Custom / OpenAI-compatible ───────────────────────────────────────────────

async function callCustom(
  prompt: string,
  opts: {
    systemInstruction?: string;
    wantJson?: boolean;
    apiKey: string;
    apiUrl: string;
    model?: string;
  },
): Promise<string> {
  const baseUrl = opts.apiUrl.replace(/\/$/, "");
  // Support both bare base URLs and full endpoint URLs
  const url = baseUrl.includes("/chat/completions")
    ? baseUrl
    : `${baseUrl}/v1/chat/completions`;

  const messages: { role: string; content: string }[] = [];

  const systemParts: string[] = [];
  if (opts.systemInstruction) systemParts.push(opts.systemInstruction);
  if (opts.wantJson) {
    systemParts.push(
      "IMPORTANT: Your response MUST be valid JSON only. Do NOT wrap it in markdown code fences. Do NOT add any explanation. Output raw JSON only.",
    );
  }
  if (systemParts.length) {
    messages.push({ role: "system", content: systemParts.join("\n\n") });
  }
  messages.push({ role: "user", content: prompt });

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model || "gpt-4o",
        messages,
        ...(opts.wantJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text: string | undefined = data?.choices?.[0]?.message?.content;
      if (!text) throw new GeminiRequestError("Custom API tidak mengembalikan konten. Coba lagi.");
      incrementUsage().catch(() => {});
      return text;
    }

    const errText = await res.text().catch(() => "");

    if ((res.status === 429 || res.status === 503) && attempt < maxAttempts) {
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new GeminiConfigError(`API key tidak valid atau tidak memiliki akses ke Custom API (${res.status}).`);
    }

    throw new GeminiRequestError(`Custom API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  throw new GeminiRequestError("Custom API: melebihi batas percobaan (rate limit). Coba lagi nanti.");
}

// ─── Unified dispatcher ───────────────────────────────────────────────────────

async function callAI(
  prompt: string,
  opts: {
    systemInstruction?: string;
    responseSchema?: Record<string, unknown>;
    temperature?: number;
    config?: AIConfig;
  } = {},
): Promise<string> {
  const provider = opts.config?.provider || "gemini";
  const apiKey = opts.config?.apiKey || null;
  const apiUrl = opts.config?.apiUrl || null;
  const model = opts.config?.model;

  if (provider === "claude") {
    if (!apiKey) {
      throw new GeminiConfigError(
        "API key Anthropic Claude belum di-set. Silakan masukkan di halaman Pengaturan (/apikeys).",
      );
    }
    return callClaude(prompt, {
      systemInstruction: opts.systemInstruction,
      wantJson: Boolean(opts.responseSchema),
      apiKey,
      apiUrl,
      model,
    });
  }

  if (provider === "custom") {
    if (!apiKey) {
      throw new GeminiConfigError(
        "API key Custom belum di-set. Silakan masukkan di halaman Pengaturan (/apikeys).",
      );
    }
    if (!apiUrl) {
      throw new GeminiConfigError(
        "URL Custom API belum di-set. Silakan masukkan di halaman Pengaturan (/apikeys).",
      );
    }
    return callCustom(prompt, {
      systemInstruction: opts.systemInstruction,
      wantJson: Boolean(opts.responseSchema),
      apiKey,
      apiUrl,
      model,
    });
  }

  // Default: Gemini
  return callGemini(prompt, {
    systemInstruction: opts.systemInstruction,
    responseSchema: opts.responseSchema,
    temperature: opts.temperature,
    apiKey,
    model,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Calls AI and parses the response as JSON matching type T. */
export async function generateJSON<T>(
  prompt: string,
  responseSchema: Record<string, unknown>,
  systemInstruction?: string,
  apiKey?: string | null,
  model?: string,
  config?: AIConfig,
): Promise<T> {
  const effectiveConfig: AIConfig = config
    ? config
    : { provider: "gemini", apiKey, model };

  const raw = await callAI(prompt, {
    responseSchema,
    systemInstruction,
    config: effectiveConfig,
  });

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Fallback: strip stray markdown fences some models still add
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

/** Calls AI for free-form text (used for PRD, final prompt, skills). */
export async function generateText(
  prompt: string,
  systemInstruction?: string,
  apiKey?: string | null,
  model?: string,
  config?: AIConfig,
): Promise<string> {
  const effectiveConfig: AIConfig = config
    ? config
    : { provider: "gemini", apiKey, model };

  return callAI(prompt, {
    systemInstruction,
    temperature: 0.7,
    config: effectiveConfig,
  });
}
