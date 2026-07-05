import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import { normalizeError, safeFetch } from "@/lib/server-api";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/goals/[id]">) {
  const { id } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  let backRes: Response;
  try {
    backRes = await safeFetch("goals/update", `${API_URL}/goals/${id}`, {
      method: "PATCH",
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
    return NextResponse.json(normalizeError(error.detail, "Failed to update goal"), {
      status: backRes.status,
    });
  }

  return NextResponse.json(await backRes.json());
}
