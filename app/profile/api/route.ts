import { type NextRequest, NextResponse } from "next/server";
import { BackendError, backApiFetch, routeErrorResponse } from "@/shared/back-api";

export async function GET() {
  try {
    return NextResponse.json(await backApiFetch("/profile", "profile"));
  } catch (err) {
    // No profile yet is a normal state for a new user, not a load failure —
    // translate the backend's 404 into an empty success instead of an error.
    if (err instanceof BackendError && err.status === 404) {
      return NextResponse.json(null);
    }
    return routeErrorResponse(err, "Failed to load profile");
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  try {
    await backApiFetch("/profile", "profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return routeErrorResponse(err, "Failed to save profile");
  }
}
