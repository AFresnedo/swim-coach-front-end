import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiErrorDetails, frontApiFetch } from "@/shared/front-api";

describe("frontApiFetch", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the parsed JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );

    await expect(frontApiFetch("/x")).resolves.toEqual({ ok: true });
  });

  it("throws an ApiError with the backend's detail and status on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })),
    );

    await expect(frontApiFetch("/x")).rejects.toMatchObject({
      message: "Not found",
      status: 404,
    });
  });

  it("falls back to a generic message when the response has no detail string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 500 })),
    );

    await expect(frontApiFetch("/x")).rejects.toMatchObject({
      message: "Request failed: 500",
      status: 500,
    });
  });

  it("still throws a usable ApiError when the error response body isn't valid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 502 })));

    await expect(frontApiFetch("/x")).rejects.toMatchObject({
      message: "Request failed: 502",
      status: 502,
    });
  });

  it("carries field-level errors through onto the thrown ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "Validation failed", errors: { email: "invalid" } }),
          {
            status: 422,
          },
        ),
      ),
    );

    await expect(frontApiFetch("/x")).rejects.toMatchObject({
      errors: { email: "invalid" },
    });
  });
});

describe("apiErrorDetails", () => {
  it("extracts the message and field errors from an ApiError", () => {
    const err = new ApiError("Validation failed", 422, { email: "invalid" });
    expect(apiErrorDetails(err, "fallback")).toEqual({
      message: "Validation failed",
      fieldErrors: { email: "invalid" },
    });
  });

  it("falls back to the given message for a non-ApiError (e.g. a thrown network error)", () => {
    expect(apiErrorDetails(new Error("network down"), "fallback")).toEqual({
      message: "fallback",
    });
  });
});
