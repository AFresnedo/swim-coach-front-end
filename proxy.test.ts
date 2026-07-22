import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { buildCspHeader, NEXT_STREAMING_BOOTSTRAP_HASH, proxy } from "@/proxy";
import { AUTH_COOKIE } from "@/shared/auth";

function makeRequest(path: string, options: { cookie?: string } = {}): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: options.cookie ? { cookie: options.cookie } : undefined,
  });
}

describe("proxy", () => {
  it("redirects to /sign-in when a protected route has no auth cookie", () => {
    const res = proxy(makeRequest("/goals"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/sign-in");
  });

  it("passes a protected route through when the auth cookie is present", () => {
    const res = proxy(makeRequest("/goals", { cookie: `${AUTH_COOKIE}=token` }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not require an auth cookie for /sign-up", () => {
    const res = proxy(makeRequest("/sign-up"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("sets a Content-Security-Policy header with a nonce on /sign-up", () => {
    const res = proxy(makeRequest("/sign-up"));
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toContain("script-src");
    expect(csp).toMatch(/'nonce-[^']+'/);
  });

  it("uses a fresh nonce on every request", () => {
    const extractNonce = (csp: string | null) => csp?.match(/'nonce-([^']+)'/)?.[1];
    const first = extractNonce(
      proxy(makeRequest("/sign-up")).headers.get("Content-Security-Policy"),
    );
    const second = extractNonce(
      proxy(makeRequest("/sign-up")).headers.get("Content-Security-Policy"),
    );
    expect(first).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it.each(["/sign-in", "/strokes/freestyle", "/goals/api", "/logout"])(
    "sets a Content-Security-Policy header on %s by default",
    (path) => {
      const res = proxy(makeRequest(path, { cookie: `${AUTH_COOKIE}=token` }));
      expect(res.headers.get("Content-Security-Policy")).toContain("script-src");
    },
  );

  it.each(["/", "/strokes", "/disclaimer", "/goals", "/profile", "/swim-log"])(
    "does not set a Content-Security-Policy header on %s, which uses a cached shell instead",
    (path) => {
      const res = proxy(makeRequest(path, { cookie: `${AUTH_COOKIE}=token` }));
      expect(res.headers.get("Content-Security-Policy")).toBeNull();
    },
  );

  // /goals is both a PROTECTED_PATH and a CACHED_SHELL_PATH, so this is the
  // one request shape where those two branches in proxy() could interfere.
  // If the cached-shell check ever moved above the auth check, this would
  // start returning the cached shell straight through instead of redirecting
  // a logged-out visitor — a protected page silently rendering for someone
  // who was never authenticated. The CSP assertion confirms the redirect
  // response short-circuits cleanly, rather than also falling through to
  // withNonceAndCsp.
  it("still redirects a cached-shell protected route to /sign-in when logged out", () => {
    const res = proxy(makeRequest("/goals"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/sign-in");
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
  });
});

describe("buildCspHeader", () => {
  it("includes 'unsafe-eval' in script-src only in dev", () => {
    expect(buildCspHeader("abc", true)).toContain("'unsafe-eval'");
    expect(buildCspHeader("abc", false)).not.toContain("'unsafe-eval'");
  });

  it("includes 'unsafe-inline' in style-src only in dev", () => {
    expect(buildCspHeader("abc", true)).toContain("style-src 'self' 'nonce-abc' 'unsafe-inline'");
    expect(buildCspHeader("abc", false)).not.toContain("'unsafe-inline'");
  });

  it("embeds the given nonce in both script-src and style-src", () => {
    const csp = buildCspHeader("my-nonce-value", false);
    expect(csp).toContain("script-src 'self' 'nonce-my-nonce-value'");
    expect(csp).toContain("style-src 'self' 'nonce-my-nonce-value'");
  });

  it("allows the Turnstile origin as a script, frame, and connect source", () => {
    const csp = buildCspHeader("abc", false);
    expect(csp).toMatch(/script-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(csp).toContain("frame-src https://challenges.cloudflare.com");
    expect(csp).toContain("connect-src 'self' https://challenges.cloudflare.com");
  });

  // No 'strict-dynamic' — see the comment above buildCspHeader for why. This
  // pins that decision so it can't drift back in unnoticed.
  it("does not include 'strict-dynamic' in script-src", () => {
    expect(buildCspHeader("abc", false)).not.toContain("'strict-dynamic'");
  });

  // React's streaming-replay bootstrap script never gets Next's automatic
  // nonce under cacheComponents, so it's allowed via a hash instead — this
  // pins that hash so a future edit to buildCspHeader can't drop it
  // unnoticed.
  it("hash-pins React's streaming-replay bootstrap script in script-src", () => {
    expect(buildCspHeader("abc", false)).toContain(NEXT_STREAMING_BOOTSTRAP_HASH);
  });
});
