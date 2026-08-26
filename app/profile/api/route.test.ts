import { afterEach, describe, expect, it, vi } from "vitest";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import { GET } from "@/app/profile/api/route";

describe("GET /profile/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("returns 401 when there's no auth cookie", async () => {
    getCookie.mockReturnValue(undefined);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("translates a backend 404 into an empty 200 instead of an error", async () => {
    getCookie.mockReturnValue({ value: "token" });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: "Profile not found" }), { status: 404 }),
        ),
    );

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("forwards the profile on success", async () => {
    getCookie.mockReturnValue({ value: "token" });
    const profile = {
      id: 1,
      user_id: 1,
      age: 28,
      height_cm: 177.8,
      weight_kg: 69.9,
      sex: "female",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(profile), { status: 200 })),
    );

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(profile);
  });

  it("forwards a genuine backend error instead of swallowing it", async () => {
    getCookie.mockReturnValue({ value: "token" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Boom" }), { status: 500 })),
    );

    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ detail: "Boom" });
  });
});
