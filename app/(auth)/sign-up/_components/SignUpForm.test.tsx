import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { ApiError, frontApiFetch } from "@/shared/front-api";

const mockFetch = vi.mocked(frontApiFetch);

// Turnstile auto-verifies with a stand-in token in test mode, so these tests
// exercise the real Turnstile component instead of mocking it out — matching
// how a parent form's tests use its real children elsewhere in this app.
async function renderInTurnstileTestMode() {
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
  vi.resetModules();
  const { default: SignUpForm } = await import("@/app/(auth)/sign-up/_components/SignUpForm");
  render(<SignUpForm nonce="test-nonce" />);
}

function fillForm() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Jane Smith" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "hunter2222" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "hunter2222" },
  });
  fireEvent.click(screen.getByLabelText(/advice has not been reviewed/));
  fireEvent.click(screen.getByLabelText(/wiped or reset/));
}

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("disables the submit button until both acknowledgements are checked", async () => {
    await renderInTurnstileTestMode();
    const submit = screen.getByRole("button", { name: /create account/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/advice has not been reviewed/));
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/wiped or reset/));
    expect(submit).not.toBeDisabled();
  });

  it("shows a field error when passwords don't match, without calling the API", async () => {
    await renderInTurnstileTestMode();
    fillForm();
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("submits the form fields plus the turnstile token and redirects home on success", async () => {
    await renderInTurnstileTestMode();
    mockFetch.mockResolvedValueOnce({ ok: true });
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith("/sign-up/api", {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Smith",
        email: "jane@example.com",
        password: "hunter2222",
        turnstileToken: "test-mode-token",
      }),
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the fallback error message when submission fails without field errors", async () => {
    await renderInTurnstileTestMode();
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows field-specific errors when submission fails with them", async () => {
    await renderInTurnstileTestMode();
    mockFetch.mockRejectedValueOnce(
      new ApiError("Validation failed", 422, { email: "Email already registered" }),
    );
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
  });

  it("shows 'Creating account…' and disables the button while submitting", async () => {
    await renderInTurnstileTestMode();
    let resolve: () => void;
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = () => r({ ok: true });
        }),
    );
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /creating account/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
    // biome-ignore lint/style/noNonNullAssertion: resolve is always assigned before this line
    resolve!();
  });
});
