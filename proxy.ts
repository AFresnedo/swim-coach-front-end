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

// React's own streaming-replay bootstrap ("requestAnimationFrame(function(){
// $RT=performance.now()});", verified by hashing it directly) never gets
// Next's automatic nonce stamp under cacheComponents, same root cause as the
// 'strict-dynamic' issue below (vercel/next.js#89754). Its content is fixed
// (not per-request data), so it's a legitimate hash-pin rather than a nonce
// workaround. If a future Next.js version changes this script, the hash
// stops matching and this specific violation comes back — no worse than not
// pinning it at all, just back to today's behavior, not a new failure mode.
export const NEXT_STREAMING_BOOTSTRAP_HASH =
  "'sha256-7mu4H06fwDCjmnxxr/xNHyuQC6pLTHr4M2E4jXw5WZs='";

// No 'strict-dynamic': Next's own automatic nonce-stamping of its framework
// chunks doesn't reliably reach every script tag under cacheComponents (see
// https://github.com/vercel/next.js/issues/89754), and 'strict-dynamic'
// disables 'self' entirely, so an un-nonced first-party chunk gets blocked
// outright rather than falling back to being same-origin-trusted. 'self'
// still requires inline scripts to carry a valid nonce — only script tags
// with a src get the same-origin pass — and this app has no file-upload or
// user-content-serving same-origin path an attacker could point a script at
// instead, so that's a real, checked trade-off, not an unexamined one.
export function buildCspHeader(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${NEXT_STREAMING_BOOTSTRAP_HASH} https://challenges.cloudflare.com${
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

// One decision with two exhaustive branches: a cached-shell path skips CSP,
// everything else gets it.
function applyCspUnlessCachedShell(request: NextRequest): NextResponse {
  if (CACHED_SHELL_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return withNonceAndCsp(request);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = request.cookies.has(AUTH_COOKIE);

  // Guard clause: nothing else about a page (CSP, caching) matters once the
  // visitor is being redirected away from it, so this has to run first.
  if (PROTECTED_PATH.test(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return applyCspUnlessCachedShell(request);
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
