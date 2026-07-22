import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { buildCspHeader, proxy } from "@/proxy";
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

  it("does not set a CSP header for routes outside the CSP scope", () => {
    const res = proxy(makeRequest("/goals", { cookie: `${AUTH_COOKIE}=token` }));
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
    expect(csp).toContain(
      "script-src 'self' 'nonce-abc' 'strict-dynamic' https://challenges.cloudflare.com",
    );
    expect(csp).toContain("frame-src https://challenges.cloudflare.com");
    expect(csp).toContain("connect-src 'self' https://challenges.cloudflare.com");
  });
});
