import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "@/app/profile/_components/ProfileForm";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
// A stable object, matching real next/navigation's useRouter, since
// ProfileForm depends on the protected-fetch function's identity in a
// useEffect dependency array — a fresh object per call would refire it.
const router = { push, replace, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/lib/front-api";

const mockFetch = vi.mocked(frontApiFetch);

const existingProfile: {
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: string;
  unit_preference: "metric" | "imperial";
} = {
  age: 28,
  height_cm: 177.8,
  weight_kg: 69.9,
  sex: "female",
  unit_preference: "metric",
};

function fillMetricForm() {
  fireEvent.change(screen.getByLabelText("Age"), { target: { value: "25" } });
  fireEvent.change(screen.getByPlaceholderText("cm"), { target: { value: "175" } });
  fireEvent.change(screen.getByPlaceholderText("kg"), { target: { value: "70" } });
  fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "male" } });
}

// Waits for pending promise continuations (state updates from a resolved
// mock fetch) to actually land, wrapped in act(), before the test proceeds.
// The call count itself is already true the instant it's called — awaiting
// it is what matters, not the specific condition it polls.
async function settleAsyncEffects(expectedCallCount: number) {
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(expectedCallCount));
}

// mockFetch doesn't know or care which call is the load vs. the save — each
// call just pops the next queued response in order, so tests declare what the
// next call returns rather than the mock inferring it from method/args.
async function renderAndAwaitLoad(profile: typeof existingProfile | null = null) {
  mockFetch.mockResolvedValueOnce(profile);
  render(<ProfileForm />);
  await settleAsyncEffects(1);
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders metric inputs by default", async () => {
    await renderAndAwaitLoad();
    expect(screen.getByPlaceholderText("cm")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("kg")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("ft")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("lbs")).not.toBeInTheDocument();
  });

  it("switching to imperial shows ft/in/lbs and hides cm/kg", async () => {
    await renderAndAwaitLoad();
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect(screen.getByPlaceholderText("ft")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("in")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("lbs")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("cm")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("kg")).not.toBeInTheDocument();
  });

  it("switching back to metric restores cm/kg inputs", async () => {
    await renderAndAwaitLoad();
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.click(screen.getByRole("button", { name: /metric/i }));
    expect(screen.getByPlaceholderText("cm")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("kg")).toBeInTheDocument();
  });

  it("prefills metric fields from an existing profile", async () => {
    await renderAndAwaitLoad(existingProfile);
    expect(screen.getByLabelText("Age")).toHaveValue(28);
    expect(screen.getByPlaceholderText("cm")).toHaveValue(177.8);
    expect(screen.getByPlaceholderText("kg")).toHaveValue(69.9);
    expect(screen.getByLabelText("Sex")).toHaveValue("female");
  });

  it("prefills imperial fields converted from the loaded metric profile", async () => {
    await renderAndAwaitLoad(existingProfile);
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect(screen.getByPlaceholderText("ft")).toHaveValue(5);
    expect(screen.getByPlaceholderText("in")).toHaveValue(10);
    expect(screen.getByPlaceholderText("lbs")).toHaveValue(154);
  });

  it("toggles to imperial on load when the profile prefers imperial", async () => {
    await renderAndAwaitLoad({ ...existingProfile, unit_preference: "imperial" });
    expect(screen.getByPlaceholderText("ft")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("cm")).not.toBeInTheDocument();
  });

  it("leaves fields blank when no profile exists yet", async () => {
    await renderAndAwaitLoad(null);
    expect(screen.getByLabelText("Age")).not.toHaveValue();
    expect(screen.getByPlaceholderText("cm")).not.toHaveValue();
  });

  it("submits metric values as-is", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockResolvedValueOnce({ ok: true });
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await settleAsyncEffects(2);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        age: 25,
        height_cm: 175,
        weight_kg: 70,
        sex: "male",
        unit_preference: "metric",
      }),
    });
  });

  it("converts imperial values to metric before submitting", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockResolvedValueOnce({ ok: true });
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.change(screen.getByLabelText("Age"), { target: { value: "30" } });
    fireEvent.change(screen.getByPlaceholderText("ft"), { target: { value: "5" } });
    fireEvent.change(screen.getByPlaceholderText("in"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("lbs"), { target: { value: "154" } });
    fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "female" } });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await settleAsyncEffects(2);
    const body = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
    // 5ft 10in = 70in * 2.54 = 177.8cm
    expect(body.height_cm).toBe(177.8);
    // 154lbs * 0.453592 = 69.853... → 69.9kg
    expect(body.weight_kg).toBe(69.9);
    expect(body.age).toBe(30);
    expect(body.sex).toBe("female");
    expect(body.unit_preference).toBe("imperial");
  });

  it("resyncs imperial fields from an edit made in metric before toggling", async () => {
    await renderAndAwaitLoad(existingProfile);
    mockFetch.mockResolvedValueOnce({ ok: true });
    // Edit height/weight while metric is active, then toggle without touching
    // the imperial fields directly — they must pick up the edit, not the
    // stale values computed from the profile load.
    fireEvent.change(screen.getByPlaceholderText("cm"), { target: { value: "160" } });
    fireEvent.change(screen.getByPlaceholderText("kg"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await settleAsyncEffects(2);
    const body = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
    expect(body.height_cm).toBe(160);
    // 50kg → round(50 / 0.453592) = 110lbs → round(110 * 0.453592, 1) = 49.9kg
    expect(body.weight_kg).toBe(49.9);
  });

  it("resyncs metric fields from an edit made in imperial before toggling back", async () => {
    await renderAndAwaitLoad(existingProfile);
    mockFetch.mockResolvedValueOnce({ ok: true });
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.change(screen.getByPlaceholderText("ft"), { target: { value: "6" } });
    fireEvent.change(screen.getByPlaceholderText("in"), { target: { value: "0" } });
    fireEvent.change(screen.getByPlaceholderText("lbs"), { target: { value: "200" } });
    fireEvent.click(screen.getByRole("button", { name: /metric/i }));
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await settleAsyncEffects(2);
    const body = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
    // 6ft 0in = 72in * 2.54 = 182.9cm
    expect(body.height_cm).toBe(182.9);
    // 200lbs * 0.453592 = 90.7184 → 90.7kg
    expect(body.weight_kg).toBe(90.7);
  });

  it("submits 'prefer_not_to_say' when selected for sex", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockResolvedValueOnce({ ok: true });
    fillMetricForm();
    fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "prefer_not_to_say" } });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await settleAsyncEffects(2);
    const body = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
    expect(body.sex).toBe("prefer_not_to_say");
  });

  it("shows 'Profile saved.' after successful submit", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockResolvedValueOnce({ ok: true });
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);
    expect(await screen.findByText("Profile saved.")).toBeInTheDocument();
  });

  it("shows error message when submission fails", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("shows an error when the profile fails to load", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    render(<ProfileForm />);
    expect(
      await screen.findByText("Failed to load your profile. Please try again."),
    ).toBeInTheDocument();
  });

  it("redirects to sign-in instead of showing an error when the session has expired", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Could not validate credentials", 401));
    render(<ProfileForm />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in?sessionExpired=1"));
    expect(
      screen.queryByText("Failed to load your profile. Please try again."),
    ).not.toBeInTheDocument();
  });

  it("shows 'Saving…' and disables button during submission", async () => {
    await renderAndAwaitLoad();
    let resolve: () => void;
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = () => r({ ok: true });
        }),
    );
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    // biome-ignore lint/style/noNonNullAssertion: resolve is always assigned before this line
    resolve!();
  });
});
