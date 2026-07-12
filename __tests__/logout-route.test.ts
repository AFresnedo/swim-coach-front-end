import { afterEach, describe, expect, it, vi } from "vitest";

const { getCookie, deleteCookie } = vi.hoisted(() => ({
  getCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie, delete: deleteCookie }),
}));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
    deleteCookie.mockReset();
  });

  it("forwards the cookie as a bearer token to the backend, then clears the cookie", async () => {
    getCookie.mockReturnValue({ value: "token" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
    expect(deleteCookie).toHaveBeenCalledWith("access_token");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("still clears the cookie when the backend call fails", async () => {
    getCookie.mockReturnValue({ value: "token" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Boom" }), { status: 500 })),
    );

    const res = await POST();

    expect(deleteCookie).toHaveBeenCalledWith("access_token");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("still clears the cookie when there's no auth cookie to forward", async () => {
    getCookie.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(deleteCookie).toHaveBeenCalledWith("access_token");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
