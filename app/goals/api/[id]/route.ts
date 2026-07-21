import { type NextRequest, NextResponse } from "next/server";
import { backApiFetch, backendErrorResponse, parseNumericId } from "@/shared/back-api";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/goals/api/[id]">) {
  const { id } = await ctx.params;
  const goalId = parseNumericId(id);
  if (goalId instanceof NextResponse) return goalId;

  const body = await req.json();

  try {
    const data = await backApiFetch(`/goals/${goalId}`, "goals/update", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    return backendErrorResponse(err, "Failed to update goal");
  }
}
