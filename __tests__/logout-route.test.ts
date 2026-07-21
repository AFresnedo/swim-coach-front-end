import { afterEach, describe, expect, it, vi } from "vitest";

const { getCookie, deleteCookie } = vi.hoisted(() => ({
  getCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie, delete: deleteCookie }),
}));

import { POST } from "@/app/api/logout/route";

describe("POST /api/logout", () => {
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

  it("does NOT clear the cookie when the backend revoke call fails", async () => {
    // A failed revoke must not look like a successful logout: the old token
    // is still valid server-side, so clearing the cookie here would leave
    // the user thinking they're logged out while it keeps working elsewhere.
    getCookie.mockReturnValue({ value: "token" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Boom" }), { status: 500 })),
    );

    const res = await POST();

    expect(deleteCookie).not.toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ detail: "Boom" });
  });

  it("returns 401 without calling the backend when there's no auth cookie to forward", async () => {
    getCookie.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(deleteCookie).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });
});
