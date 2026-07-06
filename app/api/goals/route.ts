import { type NextRequest, NextResponse } from "next/server";
import { backApiFetch, backendErrorResponse } from "@/lib/server-api";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "active";

  try {
    return NextResponse.json(await backApiFetch(`/goals?status=${status}`, "goals"));
  } catch (err) {
    return backendErrorResponse(err, "Failed to load goals");
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const data = await backApiFetch("/goals", "goals/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return backendErrorResponse(err, "Failed to create goal");
  }
}
