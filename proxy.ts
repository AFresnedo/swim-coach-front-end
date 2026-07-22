import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/shared/auth";

const PROTECTED_PATH = /^\/(profile|goals|swim-log)(\/|$)/;

// Pages that opted into cacheComponents' `use cache` static-shell caching —
// kept in sync by hand with which page.tsx files carry the directive, since
// proxy.ts has no way to introspect that from here. If this list falls out
// of sync with reality in either direction: a page that gains `use cache`
// without being added here still gets a fresh per-request nonce from
// withNonceAndCsp, which won't match whatever nonce (if any) is baked into
// its already-cached HTML, so the browser blocks its scripts as a CSP
// violation; a page that stays listed after losing `use cache` just silently
// skips CSP for no reason, even though nothing about it needs to anymore.
const CACHED_SHELL_PATHS = new Set([
  "/",
  "/strokes",
  "/disclaimer",
  "/goals",
  "/profile",
  "/swim-log",
]);

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

type RouteContext = {
  request: NextRequest;
  pathname: string;
  isAuthenticated: boolean;
};

// A guard clause, not one rule among several — it must run first, since
// nothing else about a page (CSP, caching) matters once the visitor is being
// redirected away from it.
function redirectIfProtectedAndUnauthenticated(ctx: RouteContext): NextResponse | null {
  if (PROTECTED_PATH.test(ctx.pathname) && !ctx.isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", ctx.request.url));
  }
  return null;
}

// One decision with two exhaustive branches: a cached-shell path skips CSP,
// everything else gets it.
function applyCspUnlessCachedShell(ctx: RouteContext): NextResponse {
  if (CACHED_SHELL_PATHS.has(ctx.pathname)) {
    return NextResponse.next();
  }
  return withNonceAndCsp(ctx.request);
}

export function proxy(request: NextRequest) {
  const ctx: RouteContext = {
    request,
    pathname: request.nextUrl.pathname,
    isAuthenticated: request.cookies.has(AUTH_COOKIE),
  };

  const redirect = redirectIfProtectedAndUnauthenticated(ctx);
  if (redirect) return redirect;

  return applyCspUnlessCachedShell(ctx);
}

// Broad by default — every route gets CSP unless explicitly excluded above —
// rather than an allowlist that requires remembering to add each new
// route that needs protection. Next-internal asset paths and prefetch
// requests are skipped since there's no document response to protect there.
export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
