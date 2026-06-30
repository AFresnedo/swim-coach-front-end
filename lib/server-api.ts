import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

type FastAPIValidationError = { loc: (string | number)[]; msg: string };

export function normalizeError(
  detail: unknown,
  fallback: string,
): { detail: string; errors?: Record<string, string> } {
  if (typeof detail === "string") return { detail };
  if (Array.isArray(detail)) {
    const errors: Record<string, string> = {};
    for (const e of detail as FastAPIValidationError[]) {
      const field = String(e.loc?.at(-1) ?? "");
      if (field) errors[field] = e.msg;
    }
    return { detail: "Validation failed", errors };
  }
  return { detail: fallback };
}

export async function safeFetch(
  label: string,
  ...args: Parameters<typeof fetch>
): Promise<Response> {
  try {
    return await fetch(...args);
  } catch (err: unknown) {
    console.error(`[${label}] fetch failed:`, (err as NodeJS.ErrnoException)?.cause ?? err);
    throw new Error("Server unavailable");
  }
}

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function backApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }

  return res.json();
}
