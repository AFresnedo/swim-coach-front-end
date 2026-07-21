import { type NextRequest, NextResponse } from "next/server";
import { backApiFetch, parseNumericId, routeErrorResponse } from "@/shared/back-api";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/goals/api/[id]/deactivate">) {
  const { id } = await ctx.params;
  const body = await req.json();

  try {
    const goalId = parseNumericId(id);
    const data = await backApiFetch(`/goals/${goalId}/deactivate`, "goals/deactivate", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    return routeErrorResponse(err, "Failed to deactivate goal");
  }
}
