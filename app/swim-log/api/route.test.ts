import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import { GET, POST } from "@/app/swim-log/api/route";

function makeGetRequest(search = ""): NextRequest {
  return { nextUrl: new URL(`http://localhost/swim-log/api${search}`) } as unknown as NextRequest;
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("GET /swim-log/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("forwards only the recognized filter params, dropping anything else on the query string", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await GET(
      makeGetRequest("?date_from=2026-01-01&date_to=2026-01-01&stroke=freestyle&unknown_param=x"),
    );

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("date_from=2026-01-01");
    expect(calledUrl).toContain("date_to=2026-01-01");
    expect(calledUrl).toContain("stroke=freestyle");
    expect(calledUrl).not.toContain("unknown_param");
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

describe("POST /swim-log/api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("creates a swim time and returns 201", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    const created = { id: 1, user_id: 1, stroke: "freestyle" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(created), { status: 201 })),
    );

    const res = await POST(makePostRequest({ stroke: "freestyle" }));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });

  it("forwards a genuine backend error instead of swallowing it", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Boom" }), { status: 500 })),
    );

    const res = await POST(makePostRequest({ stroke: "freestyle" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ detail: "Boom" });
  });
});
