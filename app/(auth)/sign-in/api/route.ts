import { type NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/shared/auth";
import { API_URL, normalizeError, safeFetch } from "@/shared/back-api";

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
  await setAuthCookie(access_token);

  return NextResponse.json({ ok: true });
}
