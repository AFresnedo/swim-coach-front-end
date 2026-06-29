interface ValidationError {
  loc: (string | number)[];
  msg: string;
}

function formatErrorDetail(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((err: ValidationError) => {
        const field = err.loc?.at(-1);
        return field ? `${field}: ${err.msg}` : err.msg;
      })
      .join(", ");
  }

  return `Request failed: ${status}`;
}

export async function frontApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(formatErrorDetail(body.detail, res.status));
  }

  return res.json();
}
