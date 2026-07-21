import { type NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/shared/auth";
import { API_URL, normalizeError, safeFetch } from "@/shared/back-api";
import { TURNSTILE_TEST_MODE } from "@/shared/constants";

// Throws for anything that isn't Cloudflare actually looking at the token and
// saying yes/no (missing config, network failure, timeout, a non-2xx from
// Cloudflare, an unparseable response) so the caller can tell "this token is
// invalid" (400) apart from "we couldn't verify it" (502) — see
// `backend-unavailable` handling below for the same split on the backend call.
async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (TURNSTILE_TEST_MODE) return true;
  if (typeof token !== "string" || !token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not configured");

  const res = await safeFetch(
    "turnstile/siteverify",
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      // Fail fast rather than holding the registration request open for
      // undici's ~5min default if Cloudflare is slow or unresponsive.
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error(`siteverify responded with ${res.status}`);

  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  const parsed = await req.json();
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }
  const { turnstileToken, ...body } = parsed;

  let turnstileVerified: boolean;
  try {
    turnstileVerified = await verifyTurnstile(turnstileToken);
  } catch {
    return NextResponse.json({ detail: "CAPTCHA verification unavailable" }, { status: 502 });
  }
  if (!turnstileVerified) {
    return NextResponse.json({ detail: "CAPTCHA verification failed" }, { status: 400 });
  }

  let backRes: Response;
  try {
    backRes = await safeFetch("auth/register", `${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
  }

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(normalizeError(error.detail, "Registration failed"), {
      status: backRes.status,
    });
  }

  const { access_token } = await backRes.json();
  await setAuthCookie(access_token);

  return NextResponse.json({ ok: true });
}
