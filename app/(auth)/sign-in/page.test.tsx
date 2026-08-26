import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "@/app/(auth)/sign-in/page";
import { ApiError, frontApiFetch } from "@/shared/front-api";

const push = vi.fn();
const refresh = vi.fn();
const router = { push, refresh };
const mockSearchParams = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  useSearchParams: () => mockSearchParams(),
}));

vi.mock("@/shared/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

const mockFetch = vi.mocked(frontApiFetch);

function fillForm() {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "hunter2222" } });
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("submits email and password, then redirects home and refreshes on success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<SignInPage />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith("/sign-in/api", {
      method: "POST",
      body: JSON.stringify({ email: "jane@example.com", password: "hunter2222" }),
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the fallback error message when submission fails without field errors", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    render(<SignInPage />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows field-specific errors when submission fails with them", async () => {
    mockFetch.mockRejectedValueOnce(
      new ApiError("Validation failed", 422, { password: "Incorrect password" }),
    );
    render(<SignInPage />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Incorrect password")).toBeInTheDocument();
  });

  it("shows 'Signing in…' and disables the button while submitting", async () => {
    let resolve: (value: unknown) => void = () => {};
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(<SignInPage />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    resolve({ ok: true });
  });

  it("shows the session-expired banner when the sessionExpired query param is set", () => {
    mockSearchParams.mockReturnValueOnce(new URLSearchParams("sessionExpired=1"));
    render(<SignInPage />);

    expect(screen.getByText(/your session expired — please sign in again/i)).toBeInTheDocument();
  });

  it("does not show the session-expired banner by default", () => {
    render(<SignInPage />);

    expect(
      screen.queryByText(/your session expired — please sign in again/i),
    ).not.toBeInTheDocument();
  });
});
