import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const customKey = typeof window !== "undefined" ? localStorage.getItem("ai_api_key") : null;
  const headers = new Headers(init?.headers);
  if (customKey) {
    headers.set("x-gemini-api-key", customKey);
  }
  return fetch(url, {
    ...init,
    headers,
  });
}
