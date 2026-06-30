import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "@/components/ProfileForm";

vi.mock("@/lib/api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/lib/api";

const mockFetch = vi.mocked(frontApiFetch);

function fillMetricForm() {
  fireEvent.change(screen.getByLabelText("Age"), { target: { value: "25" } });
  fireEvent.change(screen.getByPlaceholderText("cm"), { target: { value: "175" } });
  fireEvent.change(screen.getByPlaceholderText("kg"), { target: { value: "70" } });
  fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "male" } });
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(cleanup);

  it("renders metric inputs by default", () => {
    render(<ProfileForm />);
    expect(screen.getByPlaceholderText("cm")).toBeDefined();
    expect(screen.getByPlaceholderText("kg")).toBeDefined();
    expect(screen.queryByPlaceholderText("ft")).toBeNull();
    expect(screen.queryByPlaceholderText("lbs")).toBeNull();
  });

  it("switching to imperial shows ft/in/lbs and hides cm/kg", () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect(screen.getByPlaceholderText("ft")).toBeDefined();
    expect(screen.getByPlaceholderText("in")).toBeDefined();
    expect(screen.getByPlaceholderText("lbs")).toBeDefined();
    expect(screen.queryByPlaceholderText("cm")).toBeNull();
    expect(screen.queryByPlaceholderText("kg")).toBeNull();
  });

  it("switching back to metric restores cm/kg inputs", () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.click(screen.getByRole("button", { name: /metric/i }));
    expect(screen.getByPlaceholderText("cm")).toBeDefined();
    expect(screen.getByPlaceholderText("kg")).toBeDefined();
  });

  it("submits metric values as-is", async () => {
    render(<ProfileForm />);
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    expect(mockFetch).toHaveBeenCalledWith("/api/profile", {
      method: "POST",
      body: JSON.stringify({ age: 25, height_cm: 175, weight_kg: 70, sex: "male" }),
    });
  });

  it("converts imperial values to metric before submitting", async () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    fireEvent.change(screen.getByLabelText("Age"), { target: { value: "30" } });
    fireEvent.change(screen.getByPlaceholderText("ft"), { target: { value: "5" } });
    fireEvent.change(screen.getByPlaceholderText("in"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("lbs"), { target: { value: "154" } });
    fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "female" } });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    // 5ft 10in = 70in * 2.54 = 177.8cm
    expect(body.height_cm).toBe(177.8);
    // 154lbs * 0.453592 = 69.853... → 69.9kg
    expect(body.weight_kg).toBe(69.9);
    expect(body.age).toBe(30);
    expect(body.sex).toBe("female");
  });

  it("shows 'Profile saved.' after successful submit", async () => {
    render(<ProfileForm />);
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);
    expect(await screen.findByText("Profile saved.")).toBeDefined();
  });

  it("shows error message when submission fails", async () => {
    mockFetch.mockRejectedValue(new ApiError("Server error"));
    render(<ProfileForm />);
    fillMetricForm();
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }).closest("form")!);
    expect(await screen.findByText("Server error")).toBeDefined();
  });

  it("shows 'Saving…' and disables button during submission", async () => {
    let resolve: () => void;
    mockFetch.mockReturnValue(
      new Promise((r) => {
        resolve = () => r({ ok: true });
      }),
    );
    render(<ProfileForm />);
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
