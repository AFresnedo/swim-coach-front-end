import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import { normalizeError, safeFetch } from "@/lib/server-api";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let backRes: Response;
  try {
    backRes = await safeFetch("auth/login", `${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
  }

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(normalizeError(error.detail, "Login failed"), {
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
  });

  return NextResponse.json({ ok: true });
}
