import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSignUpForm } from "@/app/(auth)/sign-up/_hooks/use-sign-up-form";
import { ApiError } from "@/shared/front-api";

const push = vi.fn();
const refresh = vi.fn();
const router = { push, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/shared/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { frontApiFetch } from "@/shared/front-api";

const mockFetch = vi.mocked(frontApiFetch);

function setUp(turnstileToken = "test-token") {
  const resetTurnstile = vi.fn();
  const { result } = renderHook(() => useSignUpForm(turnstileToken, resetTurnstile));
  return { result, resetTurnstile };
}

function fillRequiredFields(result: ReturnType<typeof setUp>["result"]) {
  act(() => result.current.setName("Jane Smith"));
  act(() => result.current.setEmail("jane@example.com"));
  act(() => result.current.setPassword("hunter2222"));
  act(() => result.current.setConfirmPassword("hunter2222"));
}

async function submit(result: ReturnType<typeof setUp>["result"]) {
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: () => {},
    } as React.SubmitEvent<HTMLFormElement>);
  });
}

describe("useSignUpForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("sets a field error and does not call the API when passwords don't match", async () => {
    const { result } = setUp();
    fillRequiredFields(result);
    act(() => result.current.setConfirmPassword("different"));

    await submit(result);

    expect(result.current.fieldErrors).toEqual({ confirmPassword: "Passwords do not match" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("submits the form fields plus the turnstile token and redirects home on success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const { result } = setUp("real-turnstile-token");
    fillRequiredFields(result);

    await submit(result);

    expect(mockFetch).toHaveBeenCalledWith("/sign-up/api", {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Smith",
        email: "jane@example.com",
        password: "hunter2222",
        turnstileToken: "real-turnstile-token",
      }),
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("sets the fallback error message and resets turnstile when submission fails without field errors", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    const { result, resetTurnstile } = setUp();
    fillRequiredFields(result);

    await submit(result);

    expect(result.current.error).toBe("Server error");
    expect(resetTurnstile).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("sets field-specific errors when submission fails with them", async () => {
    mockFetch.mockRejectedValueOnce(
      new ApiError("Validation failed", 422, { email: "Email already registered" }),
    );
    const { result } = setUp();
    fillRequiredFields(result);

    await submit(result);

    expect(result.current.fieldErrors).toEqual({ email: "Email already registered" });
  });

  it("sets loading while submitting and clears it afterward", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const { result } = setUp();
    fillRequiredFields(result);

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch({ ok: true });
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
  });
});
