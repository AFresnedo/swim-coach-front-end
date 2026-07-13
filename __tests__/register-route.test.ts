import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const { setCookie } = vi.hoisted(() => ({ setCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set: setCookie }),
}));

function makeRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("POST /api/auth/register", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    setCookie.mockReset();
  });

  it("rejects a non-object JSON body instead of crashing", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST({ json: async () => null } as unknown as NextRequest);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ detail: "Invalid request body" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a JSON array body instead of forwarding it downstream (arrays are typeof 'object' too)", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST({ json: async () => ["a", "b"] } as unknown as NextRequest);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ detail: "Invalid request body" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed with 502 (not 400) when no secret is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "tok" }),
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: "CAPTCHA verification unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("responds 502 (not 400) when siteverify is unreachable, instead of blaming the token", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "tok" }),
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: "CAPTCHA verification unavailable" });
  });

  it("responds 502 (not 400) when Cloudflare itself errors, instead of blaming the token", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "tok" }),
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: "CAPTCHA verification unavailable" });
  });

  it("bounds the siteverify call with a timeout instead of hanging indefinitely", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ success: true, access_token: "test-access-token" }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "tok" }),
    );

    const options = fetchMock.mock.calls[0][1] as { signal?: AbortSignal };
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects when Cloudflare siteverify reports failure", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({
        name: "A",
        email: "a@example.com",
        password: "pw",
        turnstileToken: "bad-token",
      }),
    );

    expect(res.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
  });

  it("forwards to the backend without the turnstileToken once siteverify passes", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "test-access-token" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({
        name: "A",
        email: "a@example.com",
        password: "pw",
        turnstileToken: "good-token",
      }),
    );

    expect(res.status).toBe(200);
    const backendCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(backendCallBody).toEqual({ name: "A", email: "a@example.com", password: "pw" });
    expect(setCookie).toHaveBeenCalledWith("access_token", "test-access-token", expect.anything());
  });

  it("ignores test mode when NODE_ENV is production, even if the flag is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "tok" }),
    );

    // Falls through to the real (here, unconfigured) verification path
    // instead of silently bypassing the CAPTCHA check.
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips siteverify entirely in test mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.resetModules();
    const { POST } = await import("@/app/api/auth/register/route");

    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ access_token: "test-access-token" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(
      makeRequest({ name: "A", email: "a@example.com", password: "pw", turnstileToken: "" }),
    );

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the backend call, no siteverify
  });
});
