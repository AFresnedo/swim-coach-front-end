import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { setCookie } = vi.hoisted(() => ({ setCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set: setCookie }),
}));

import { POST } from "@/app/(auth)/sign-in/api/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("POST /sign-in/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setCookie.mockReset();
  });

  it("sets the auth cookie and returns ok on a successful login", async () => {
    const token = fakeJwt(3600);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ access_token: token }), {
          status: 200,
        }),
      ),
    );

    const res = await POST(makeRequest({ email: "a@example.com", password: "pw" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(setCookie).toHaveBeenCalledWith("access_token", token, expect.anything());
  });

  it("forwards the backend's error detail and status instead of a generic failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Incorrect email or password" }), {
          status: 401,
        }),
      ),
    );

    const res = await POST(makeRequest({ email: "a@example.com", password: "wrong" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ detail: "Incorrect email or password" });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("falls back to a generic message when the backend error has no detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 500 })),
    );

    const res = await POST(makeRequest({ email: "a@example.com", password: "pw" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ detail: "Login failed" });
  });

  it("returns 502 instead of throwing when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const res = await POST(makeRequest({ email: "a@example.com", password: "pw" }));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: "Server unavailable" });
    expect(setCookie).not.toHaveBeenCalled();
  });
});
