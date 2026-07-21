import { type NextRequest, NextResponse } from "next/server";
import { SWIM_TIME_FILTER_PARAMS } from "@/app/swim-log/_lib/swim-times-data";
import { backApiFetch, backendErrorResponse } from "@/shared/back-api";

export async function GET(req: NextRequest) {
  const query = new URLSearchParams();
  for (const key of SWIM_TIME_FILTER_PARAMS) {
    const value = req.nextUrl.searchParams.get(key);
    if (value !== null) query.set(key, value);
  }

  try {
    return NextResponse.json(await backApiFetch(`/swim-times?${query.toString()}`, "swim-times"));
  } catch (err) {
    return backendErrorResponse(err, "Failed to load swim times");
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const data = await backApiFetch("/swim-times", "swim-times/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return backendErrorResponse(err, "Failed to create swim time");
  }
}
