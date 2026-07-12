import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backApiFetchNoBody } from "@/lib/back-api";
import { AUTH_COOKIE } from "@/lib/constants";

export async function POST() {
  const cookieStore = await cookies();

  // The backend has no per-device sessions, so invalidating this token
  // invalidates every token for the user - any logout is a logout-everywhere.
  // Best-effort: if this fails (backend down, token already expired), still
  // clear the local cookie below so the user isn't stuck logged in here.
  // TODO: log this failure once the logging system lands.
  await backApiFetchNoBody("/auth/logout", "auth/logout", { method: "POST" }).catch(() => {});

  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}
