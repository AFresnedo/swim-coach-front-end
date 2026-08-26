export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function apiErrorDetails(
  err: unknown,
  fallback: string,
): { message: string; fieldErrors?: Record<string, string> } {
  return err instanceof ApiError
    ? { message: err.message, fieldErrors: err.errors }
    : { message: fallback };
}

// Forbids a caller from supplying Content-Type at all — not just at runtime
// (where the spread order below already wins regardless), but at compile
// time, so a bad call fails the build instead of being silently ignored.
// There's no legitimate reason to override it on this JSON-only wrapper; a
// caller with different needs should write its own fetch helper rather than
// loosen this one's contract.
export type FrontApiOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string> & { "Content-Type"?: never };
};

export async function frontApiFetch<T>(path: string, options: FrontApiOptions = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    // Spread options.headers first, although a well-typed caller can't
    // actually reach this with a conflicting Content-Type — FrontApiOptions
    // above already makes that a compile error. This ordering is free
    // defense-in-depth for a caller that bypasses TypeScript.
    headers: { ...options.headers, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body.detail === "string" ? body.detail : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body.errors);
  }

  return res.json();
}
