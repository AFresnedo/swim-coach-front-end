import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/shared/auth";

const PROTECTED_PATH = /^\/(profile|goals|swim-log)(\/|$)/;

// Turnstile's widget script is the only third-party script this app loads,
// and only on /sign-up — 'strict-dynamic' already trusts anything it loads
// once the script itself carries the nonce, but listing the domain too keeps
// the policy working in the handful of older browsers that don't support
// 'strict-dynamic' yet.
export function buildCspHeader(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// A nonce-based CSP needs a fresh, unpredictable value on every request —
// Next.js reads it back out of this header to stamp its own framework
// scripts automatically, and SignUpForm/Turnstile thread it through to their
// own <Script> tag by reading the x-nonce request header.
function withNonceAndCsp(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeader(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_PATH.test(pathname) && !request.cookies.has(AUTH_COOKIE)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (pathname === "/sign-up") {
    return withNonceAndCsp(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/goals/:path*", "/swim-log/:path*", "/sign-up"],
};
