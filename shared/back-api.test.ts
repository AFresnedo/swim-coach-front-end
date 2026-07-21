import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import {
  BackendError,
  backApiFetch,
  backApiFetchNoBody,
  backendErrorResponse,
  normalizeError,
  safeFetch,
  UnauthenticatedError,
} from "@/shared/back-api";

describe("safeFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the real fetch response on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const res = await safeFetch("label", "http://localhost/x");
    expect(res.status).toBe(204);
  });

  it("throws a generic error instead of leaking the underlying network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(safeFetch("label", "http://localhost/x")).rejects.toThrow("Server unavailable");
  });
});

describe("backApiFetch / backApiFetchNoBody", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getCookie.mockReset();
  });

  it("throws UnauthenticatedError instead of calling the backend when there's no token", async () => {
    getCookie.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(backApiFetch("/goals", "goals")).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("attaches the bearer token and returns the parsed JSON body on success", async () => {
    const token = fakeJwt(3600);
    getCookie.mockReturnValue({ value: token });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await backApiFetch<{ ok: boolean }>("/goals", "goals");

    expect(data).toEqual({ ok: true });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it("throws BackendError with the response status and detail on a non-ok response", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })),
    );

    await expect(backApiFetch("/goals/1", "goals")).rejects.toMatchObject({
      status: 404,
      detail: "Not found",
    });
  });

  it("backApiFetchNoBody resolves without attempting to parse a response body", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(backApiFetchNoBody("/goals/1", "goals")).resolves.toBeUndefined();
  });
});

describe("normalizeError", () => {
  it("passes a plain string detail through unchanged", () => {
    expect(normalizeError("Not found", "fallback")).toEqual({ detail: "Not found" });
  });

  it("converts a FastAPI validation array into field-keyed errors", () => {
    expect(
      normalizeError(
        [
          { loc: ["body", "text"], msg: "field required" },
          { loc: ["body", "email"], msg: "invalid email" },
        ],
        "fallback",
      ),
    ).toEqual({
      detail: "Validation failed",
      errors: { text: "field required", email: "invalid email" },
    });
  });

  it("falls back to the given message for anything else (missing/unrecognized detail)", () => {
    expect(normalizeError(undefined, "fallback message")).toEqual({ detail: "fallback message" });
  });
});

describe("backendErrorResponse", () => {
  it("maps UnauthenticatedError to 401", async () => {
    const res = backendErrorResponse(new UnauthenticatedError(), "fallback");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ detail: "Not authenticated" });
  });

  it("maps BackendError to its own status and normalized detail", async () => {
    const res = backendErrorResponse(new BackendError(404, "Not found"), "fallback");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ detail: "Not found" });
  });

  it("maps anything else (e.g. a thrown network error) to 502", async () => {
    const res = backendErrorResponse(new Error("ECONNREFUSED"), "fallback");
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: "Server unavailable" });
  });
});
