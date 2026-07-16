import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetches with AI configuration headers injected from localStorage.
 * The server's resolveAIConfig reads these headers to determine which
 * provider/key/url to use for AI calls.
 */
export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (typeof window !== "undefined") {
    const apiKey = localStorage.getItem("ai_api_key");
    const provider = localStorage.getItem("ai_provider");
    const apiUrl = localStorage.getItem("ai_api_url");

    if (apiKey) headers.set("x-gemini-api-key", apiKey);
    if (provider) headers.set("x-ai-provider", provider);
    if (apiUrl) headers.set("x-ai-api-url", apiUrl);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}
