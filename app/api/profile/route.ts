import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import { normalizeError, safeFetch } from "@/lib/server-api";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let backRes: Response;
  try {
    backRes = await safeFetch("profile", `${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return NextResponse.json({ detail: "Server unavailable" }, { status: 502 });
  }

  // No profile yet is a normal state for a new user, not a load failure —
  // translate the backend's 404 into an empty success instead of an error.
  if (backRes.status === 404) {
    return NextResponse.json(null);
  }

  if (!backRes.ok) {
    const error = await backRes.json().catch(() => ({}));
    return NextResponse.json(normalizeError(error.detail, "Failed to load profile"), {
      status: backRes.status,
    });
  }

  return NextResponse.json(await backRes.json());
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  let backRes: Response;
  try {
    backRes = await safeFetch("profile", `${API_URL}/profile`, {
      method: "PUT",
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
    return NextResponse.json(normalizeError(error.detail, "Failed to save profile"), {
      status: backRes.status,
    });
  }

  return NextResponse.json({ ok: true });
}
