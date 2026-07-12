import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

export const API_URL = process.env.API_URL ?? "http://localhost:8000";

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

export class UnauthenticatedError extends Error {}

export class BackendError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
  ) {
    super(`Backend error ${status}`);
  }
}

async function backApiFetchRaw(
  path: string,
  label: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) throw new UnauthenticatedError();

  const res = await safeFetch(label, `${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new BackendError(res.status, body.detail);
  }

  return res;
}

export async function backApiFetch<T>(
  path: string,
  label: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await backApiFetchRaw(path, label, options);
  return res.json();
}

// For endpoints with no response body (e.g. a 204), where there's nothing to
// parse and no JSON shape to lie about with a cast.
export async function backApiFetchNoBody(
  path: string,
  label: string,
  options: RequestInit = {},
): Promise<void> {
  await backApiFetchRaw(path, label, options);
}

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

export function backendErrorResponse(err: unknown, fallback: string): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
  if (err instanceof BackendError) {
    return NextResponse.json(normalizeError(err.detail, fallback), { status: err.status });
  }
  return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
}
