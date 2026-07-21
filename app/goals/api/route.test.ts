import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import { GET, POST } from "@/app/goals/api/route";

function makeGetRequest(search = ""): NextRequest {
  return { nextUrl: new URL(`http://localhost/goals/api${search}`) } as unknown as NextRequest;
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("GET /goals/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("defaults to status=active when no status query param is given", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(makeGetRequest());

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/goals?status=active"),
      expect.anything(),
    );
  });

  it("forwards a custom status query param instead of the default", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(makeGetRequest("?status=all"));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/goals?status=all"),
      expect.anything(),
    );
  });

  it("returns 401 without calling the backend when there's no auth cookie", async () => {
    getCookie.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a genuine backend error instead of swallowing it", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Boom" }), { status: 500 })),
    );

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ detail: "Boom" });
  });
});

describe("POST /goals/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("creates a goal and returns 201", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const created = { id: 1, user_id: 1, text: "New goal", is_active: true };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(created), { status: 201 })),
    );

    const res = await POST(makePostRequest({ text: "New goal" }));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });

  it("translates a FastAPI validation error into field errors", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ detail: [{ loc: ["body", "text"], msg: "field required" }] }),
            { status: 422 },
          ),
        ),
    );

    const res = await POST(makePostRequest({}));

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      detail: "Validation failed",
      errors: { text: "field required" },
    });
  });
});
