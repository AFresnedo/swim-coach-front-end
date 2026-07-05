import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import { normalizeError, safeFetch } from "@/lib/server-api";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "active";

  let backRes: Response;
  try {
    backRes = await safeFetch("goals", `${API_URL}/goals?status=${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
  }

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(normalizeError(error.detail, "Failed to load goals"), {
      status: backRes.status,
    });
  }

  return NextResponse.json(await backRes.json());
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  let backRes: Response;
  try {
    backRes = await safeFetch("goals/create", `${API_URL}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
  }

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(normalizeError(error.detail, "Failed to create goal"), {
      status: backRes.status,
    });
  }

  return NextResponse.json(await backRes.json(), { status: 201 });
}
