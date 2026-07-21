import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import { PATCH } from "@/app/goals/api/[id]/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

function makeContext(id: string): Parameters<typeof PATCH>[1] {
  return { params: Promise.resolve({ id }) } as unknown as Parameters<typeof PATCH>[1];
}

describe("PATCH /goals/api/[id]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("updates the goal at the given id and returns it", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const updated = { id: 5, user_id: 1, text: "Updated text", is_active: true };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(updated), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await PATCH(makeRequest({ text: "Updated text" }), makeContext("5"));

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/goals/5"), expect.anything());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it("returns 400 without calling the backend when the id isn't a plain positive integer", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await PATCH(makeRequest({ text: "x" }), makeContext("../../other-resource"));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 401 without calling the backend when there's no auth cookie", async () => {
    getCookie.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await PATCH(makeRequest({ text: "x" }), makeContext("5"));

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a genuine backend error instead of swallowing it", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })),
    );

    const res = await PATCH(makeRequest({ text: "x" }), makeContext("999"));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ detail: "Not found" });
  });
});
