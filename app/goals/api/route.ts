import { type NextRequest, NextResponse } from "next/server";
import { backApiFetch, routeErrorResponse } from "@/shared/back-api";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "active";
  const query = new URLSearchParams({ status });

  try {
    return NextResponse.json(await backApiFetch(`/goals?${query.toString()}`, "goals"));
  } catch (err) {
    return routeErrorResponse(err, "Failed to load goals");
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
    return routeErrorResponse(err, "Failed to create goal");
  }
}
