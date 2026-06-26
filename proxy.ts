import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(AUTH_COOKIE)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
