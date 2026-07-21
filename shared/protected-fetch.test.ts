import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
// A stable object, matching real next/navigation's useRouter — useProtectedFrontFetch
// depends on router identity being stable across renders (see useCallback's deps).
const router = { push, replace, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/shared/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/shared/front-api";
import {
  AuthRedirectError,
  isAuthRedirect,
  protectedErrorMessage,
  useProtectedFrontFetch,
} from "@/shared/protected-fetch";

const mockFetch = vi.mocked(frontApiFetch);

describe("useProtectedFrontFetch", () => {
  afterEach(() => vi.clearAllMocks());

  it("passes calls through to frontApiFetch and returns its result on success", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useProtectedFrontFetch());

    await expect(result.current("/goals/api")).resolves.toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith("/goals/api");
  });

  it("redirects to sign-in and throws AuthRedirectError on a 401", async () => {
    mockFetch.mockRejectedValue(new ApiError("Could not validate credentials", 401));
    const { result } = renderHook(() => useProtectedFrontFetch());

    await expect(result.current("/goals/api")).rejects.toBeInstanceOf(AuthRedirectError);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in?sessionExpired=1"));
    expect(refresh).toHaveBeenCalled();
  });

  it("rethrows a non-401 ApiError without redirecting", async () => {
    mockFetch.mockRejectedValue(new ApiError("Server error", 500));
    const { result } = renderHook(() => useProtectedFrontFetch());

    await expect(result.current("/goals/api")).rejects.toMatchObject({ status: 500 });
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect when a stale 401 resolves after the component has unmounted", async () => {
    let rejectFetch: (err: unknown) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((_, reject) => {
        rejectFetch = reject;
      }),
    );
    const { result, unmount } = renderHook(() => useProtectedFrontFetch());
    const pending = result.current("/goals/api").catch(() => {});

    unmount();
    rejectFetch(new ApiError("Could not validate credentials", 401));
    await pending;

    expect(replace).not.toHaveBeenCalled();
  });
});

describe("isAuthRedirect", () => {
  it("recognizes an AuthRedirectError", () => {
    expect(isAuthRedirect(new AuthRedirectError())).toBe(true);
  });

  it("rejects any other error", () => {
    expect(isAuthRedirect(new Error("boom"))).toBe(false);
  });
});

describe("protectedErrorMessage", () => {
  it("returns null for an auth redirect, so callers show no error message", () => {
    expect(protectedErrorMessage(new AuthRedirectError(), "fallback")).toBeNull();
  });

  it("returns the ApiError's own message", () => {
    expect(protectedErrorMessage(new ApiError("Specific failure", 500), "fallback")).toBe(
      "Specific failure",
    );
  });

  it("falls back to the given message for anything else", () => {
    expect(protectedErrorMessage(new Error("boom"), "fallback message")).toBe("fallback message");
  });
});
