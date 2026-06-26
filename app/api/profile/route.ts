import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  const backRes = await fetch(`${API_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(
      { detail: error.detail ?? "Failed to save profile" },
      { status: backRes.status }
    );
  }

  return NextResponse.json({ ok: true });
}
