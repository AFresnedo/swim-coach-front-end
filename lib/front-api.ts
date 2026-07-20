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

export async function frontApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body.detail === "string" ? body.detail : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body.errors);
  }

  return res.json();
}
