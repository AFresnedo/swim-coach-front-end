import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { API_URL, normalizeError, safeFetch } from "@/lib/back-api";
import { AUTH_COOKIE } from "@/lib/constants";
import { jwtMaxAge } from "@/lib/jwt";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const body = await req.json();

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
