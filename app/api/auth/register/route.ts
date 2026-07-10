import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { API_URL, normalizeError, safeFetch } from "@/lib/back-api";
import { AUTH_COOKIE } from "@/lib/constants";
import { jwtMaxAge } from "@/lib/jwt";

const IS_PROD = process.env.NODE_ENV === "production";

// Bypasses the siteverify call entirely (no network) when true. Only ever set
// in .env.local for local dev/e2e — never in ../infra's staging/prod env
// config, or sign-up would ship with no CAPTCHA enforcement.
// Shares the NEXT_PUBLIC_ name with components/Turnstile.tsx's client-side
// flag (NEXT_PUBLIC_ vars are also readable server-side) so there's one flag
// to set instead of two that can drift out of sync.
const TURNSTILE_TEST_MODE = process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "true";

async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (TURNSTILE_TEST_MODE) return true;
  if (typeof token !== "string" || !token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false; // fail closed: reject rather than skip verification

  const res = await safeFetch(
    "turnstile/siteverify",
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    },
  ).catch(() => null);
  if (!res) return false;

  const data = await res.json().catch(() => ({ success: false }));
  return data.success === true;
}

export async function POST(req: NextRequest) {
  const parsed = await req.json();
  if (typeof parsed !== "object" || parsed === null) {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }
  const { turnstileToken, ...body } = parsed;

  if (!(await verifyTurnstile(turnstileToken))) {
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
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, access_token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: jwtMaxAge(access_token),
  });

  return NextResponse.json({ ok: true });
}
