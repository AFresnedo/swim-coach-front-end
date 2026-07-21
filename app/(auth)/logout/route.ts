import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backApiFetchNoBody, backendErrorResponse } from "@/shared/back-api";
import { AUTH_COOKIE } from "@/shared/constants";

export async function POST() {
  // The backend has no per-device sessions, so invalidating this token
  // invalidates every token for the user - any logout is a logout-everywhere.
  // If the revoke call fails (backend down, etc.), don't clear the local
  // cookie or report success: a token that's still valid server-side while
  // the user believes they're logged out is a worse outcome than an
  // annoying "try again" - it's a silent security gap, not just bad UX.
  try {
    await backApiFetchNoBody("/auth/logout", "auth/logout", { method: "POST" });
  } catch (err) {
    return backendErrorResponse(err, "Log out failed");
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}
