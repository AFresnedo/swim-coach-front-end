import { NextResponse } from "next/server";
import { getAuthToken } from "@/shared/auth";

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

export class InvalidIdError extends Error {}

// Forbids a caller from supplying these two keys at all — not just at
// runtime (where the spread order below already wins regardless), but at
// compile time, so a bad call fails the build instead of being silently
// ignored. There's no legitimate reason to override either on this JSON,
// token-bearing wrapper; a caller with different needs should write its own
// fetch helper rather than loosen this one's contract.
type BackApiOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string> & { Authorization?: never; "Content-Type"?: never };
};

async function backApiFetchRaw(
  path: string,
  label: string,
  options: BackApiOptions = {},
): Promise<Response> {
  const token = await getAuthToken();
  if (!token) throw new UnauthenticatedError();

  const res = await safeFetch(label, `${API_URL}${path}`, {
    ...options,
    // Spread options.headers first, although a well-typed caller can't
    // actually reach this with a conflicting Authorization/Content-Type —
    // BackApiOptions above already makes that a compile error. This
    // ordering is free defense-in-depth for a caller that bypasses TypeScript.
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
  options: BackApiOptions = {},
): Promise<T> {
  const res = await backApiFetchRaw(path, label, options);
  return res.json();
}

// For endpoints with no response body (e.g. a 204), where there's nothing to
// parse and no JSON shape to lie about with a cast.
export async function backApiFetchNoBody(
  path: string,
  label: string,
  options: BackApiOptions = {},
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

export function routeErrorResponse(err: unknown, fallback: string): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
  if (err instanceof InvalidIdError) {
    return NextResponse.json({ detail: "Invalid id" }, { status: 400 });
  }
  if (err instanceof BackendError) {
    return NextResponse.json(normalizeError(err.detail, fallback), { status: err.status });
  }
  return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
}

// A dynamic route segment's raw string value gets forwarded as-is into the
// backend request path (e.g. `/goals/${id}`) — without validating its shape
// first, a value like "../../other-resource" would smuggle extra path
// segments into that URL instead of naming a single resource. Restricting it
// to a plain positive integer closes that off before it reaches backApiFetch.
export function parseNumericId(raw: string): number {
  if (!/^[1-9]\d*$/.test(raw)) throw new InvalidIdError();
  return Number(raw);
}
