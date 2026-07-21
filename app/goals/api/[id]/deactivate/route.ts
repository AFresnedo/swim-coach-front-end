import { type NextRequest, NextResponse } from "next/server";
import { backApiFetch, backendErrorResponse } from "@/lib/back-api";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/goals/api/[id]/deactivate">) {
  const { id } = await ctx.params;
  const body = await req.json();

  try {
    const data = await backApiFetch(`/goals/${id}/deactivate`, "goals/deactivate", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    return backendErrorResponse(err, "Failed to deactivate goal");
  }
}
