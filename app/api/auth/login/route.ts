import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(
      { detail: error.detail ?? "Login failed" },
      { status: backRes.status }
    );
  }

  const { access_token } = await backRes.json();
  const cookieStore = await cookies();
  cookieStore.set("access_token", access_token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
