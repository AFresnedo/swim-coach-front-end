import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "@/components/ProfileForm";

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
    expect(screen.getByPlaceholderText("cm")).toBeDefined();
    expect(screen.getByPlaceholderText("kg")).toBeDefined();
    expect(screen.queryByPlaceholderText("ft")).toBeNull();
    expect(screen.queryByPlaceholderText("lbs")).toBeNull();
  });

  it("switching to imperial shows ft/in/lbs and hides cm/kg", async () => {
    await renderAndAwaitLoad();
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect(screen.getByPlaceholderText("ft")).toBeDefined();
    expect(screen.getByPlaceholderText("in")).toBeDefined();
    expect(screen.getByPlaceholderText("lbs")).toBeDefined();
    expect(screen.queryByPlaceholderText("cm")).toBeNull();
    expect(screen.queryByPlaceholderText("kg")).toBeNull();
  });

  it("switching back to metric restores cm/kg inputs", async () => {
    await renderAndAwaitLoad();
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.click(screen.getByRole("button", { name: /metric/i }));
    expect(screen.getByPlaceholderText("cm")).toBeDefined();
    expect(screen.getByPlaceholderText("kg")).toBeDefined();
  });

  it("prefills metric fields from an existing profile", async () => {
    await renderAndAwaitLoad(existingProfile);
    expect((screen.getByLabelText("Age") as HTMLInputElement).value).toBe("28");
    expect((screen.getByPlaceholderText("cm") as HTMLInputElement).value).toBe("177.8");
    expect((screen.getByPlaceholderText("kg") as HTMLInputElement).value).toBe("69.9");
    expect((screen.getByLabelText("Sex") as HTMLSelectElement).value).toBe("female");
  });

  it("prefills imperial fields converted from the loaded metric profile", async () => {
    await renderAndAwaitLoad(existingProfile);
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect((screen.getByPlaceholderText("ft") as HTMLInputElement).value).toBe("5");
    expect((screen.getByPlaceholderText("in") as HTMLInputElement).value).toBe("10");
    expect((screen.getByPlaceholderText("lbs") as HTMLInputElement).value).toBe("154");
  });

  it("toggles to imperial on load when the profile prefers imperial", async () => {
    await renderAndAwaitLoad({ ...existingProfile, unit_preference: "imperial" });
    expect(screen.getByPlaceholderText("ft")).toBeDefined();
    expect(screen.queryByPlaceholderText("cm")).toBeNull();
  });

  it("leaves fields blank when no profile exists yet", async () => {
    await renderAndAwaitLoad(null);
    expect((screen.getByLabelText("Age") as HTMLInputElement).value).toBe("");
    expect((screen.getByPlaceholderText("cm") as HTMLInputElement).value).toBe("");
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
    expect(await screen.findByText("Profile saved.")).toBeDefined();
  });

  it("shows error message when submission fails", async () => {
    await renderAndAwaitLoad();
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);
    expect(await screen.findByText("Server error")).toBeDefined();
  });

  it("shows an error when the profile fails to load", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Server error", 500));
    render(<ProfileForm />);
    expect(await screen.findByText("Failed to load your profile. Please try again.")).toBeDefined();
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

    await waitFor(() => expect(screen.getByRole("button", { name: /saving/i })).toBeDefined());
    expect((screen.getByRole("button", { name: /saving/i }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    // biome-ignore lint/style/noNonNullAssertion: resolve is always assigned before this line
    resolve!();
  });
});
