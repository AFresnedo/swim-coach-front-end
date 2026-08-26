import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type UnitSystem, useProfileForm } from "@/app/profile/_hooks/use-profile-form";
import { ApiError } from "@/shared/front-api";
import { AuthRedirectError } from "@/shared/protected-fetch";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

const existingProfile: {
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: string;
  unit_preference: UnitSystem;
} = {
  age: 28,
  height_cm: 177.8,
  weight_kg: 69.9,
  sex: "female",
  unit_preference: "metric",
};

function setUp() {
  return renderHook(() => useProfileForm());
}

async function loadWith(profile: typeof existingProfile | null) {
  protectedFrontFetch.mockResolvedValueOnce(profile);
  const { result } = setUp();
  await waitFor(() => expect(result.current.loadingProfile).toBe(false));
  return result;
}

async function submit(result: ReturnType<typeof setUp>["result"]) {
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: () => {},
    } as React.SubmitEvent<HTMLFormElement>);
  });
}

describe("useProfileForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("prefills metric fields and computed imperial fields from a loaded profile", async () => {
    const result = await loadWith(existingProfile);
    expect(result.current.age).toBe("28");
    expect(result.current.heightCm).toBe("177.8");
    expect(result.current.weightKg).toBe("69.9");
    expect(result.current.sex).toBe("female");
    // 177.8cm -> 5ft 10in, 69.9kg -> round(69.9 / 0.453592) = 154lbs
    expect(result.current.heightFt).toBe("5");
    expect(result.current.heightIn).toBe("10");
    expect(result.current.weightLbs).toBe("154");
  });

  it("switches to imperial on load when the profile prefers imperial", async () => {
    const result = await loadWith({ ...existingProfile, unit_preference: "imperial" });
    expect(result.current.units).toBe("imperial");
  });

  it("leaves fields blank when no profile exists yet", async () => {
    const result = await loadWith(null);
    expect(result.current.age).toBe("");
    expect(result.current.heightCm).toBe("");
  });

  async function loadRejecting(err: unknown) {
    protectedFrontFetch.mockRejectedValueOnce(err);
    const { result } = setUp();
    await waitFor(() => expect(result.current.loadingProfile).toBe(false));
    return result;
  }

  it("sets an error when the profile fails to load", async () => {
    const result = await loadRejecting(new ApiError("Server error", 500));
    expect(result.current.error).toBe("Failed to load your profile. Please try again.");
  });

  it("does not set an error when the load fails with an auth redirect", async () => {
    const result = await loadRejecting(new AuthRedirectError());
    expect(result.current.error).toBe("");
  });

  it("resyncs imperial fields from an edit made in metric before toggling", async () => {
    const result = await loadWith(existingProfile);
    act(() => result.current.setHeightCm("160"));
    act(() => result.current.setWeightKg("50"));
    act(() => result.current.setUnits("imperial"));

    // 160cm -> 5ft 3in, round(50 / 0.453592) = 110lbs
    expect(result.current.heightFt).toBe("5");
    expect(result.current.heightIn).toBe("3");
    expect(result.current.weightLbs).toBe("110");
  });

  it("resyncs metric fields from an edit made in imperial before toggling back", async () => {
    const result = await loadWith(existingProfile);
    act(() => result.current.setUnits("imperial"));
    act(() => result.current.setHeightFt("6"));
    act(() => result.current.setHeightIn("0"));
    act(() => result.current.setWeightLbs("200"));
    act(() => result.current.setUnits("metric"));

    // 6ft 0in = 72in * 2.54 = 182.9cm, 200lbs * 0.453592 = 90.7184 -> 90.7kg
    expect(result.current.heightCm).toBe("182.9");
    expect(result.current.weightKg).toBe("90.7");
  });

  it("submits metric values as-is", async () => {
    const result = await loadWith(null);
    protectedFrontFetch.mockResolvedValueOnce({ ok: true });

    act(() => result.current.setAge("25"));
    act(() => result.current.setHeightCm("175"));
    act(() => result.current.setWeightKg("70"));
    act(() => result.current.setSex("male"));

    await submit(result);

    expect(protectedFrontFetch).toHaveBeenLastCalledWith("/profile/api", {
      method: "PUT",
      body: JSON.stringify({
        age: 25,
        height_cm: 175,
        weight_kg: 70,
        sex: "male",
        unit_preference: "metric",
      }),
    });
    expect(result.current.saved).toBe(true);
  });

  it("converts imperial values to metric before submitting", async () => {
    const result = await loadWith(null);
    protectedFrontFetch.mockResolvedValueOnce({ ok: true });

    act(() => result.current.setUnits("imperial"));
    act(() => result.current.setAge("30"));
    act(() => result.current.setHeightFt("5"));
    act(() => result.current.setHeightIn("10"));
    act(() => result.current.setWeightLbs("154"));
    act(() => result.current.setSex("female"));

    await submit(result);

    const body = JSON.parse(protectedFrontFetch.mock.calls[1][1].body);
    // 5ft 10in = 70in * 2.54 = 177.8cm
    expect(body.height_cm).toBe(177.8);
    // 154lbs * 0.453592 = 69.853... -> 69.9kg
    expect(body.weight_kg).toBe(69.9);
    expect(body.age).toBe(30);
    expect(body.sex).toBe("female");
    expect(body.unit_preference).toBe("imperial");
  });

  it("sets a general error and field errors when submission fails", async () => {
    const result = await loadWith(null);
    protectedFrontFetch.mockRejectedValueOnce(
      new ApiError("Validation failed", 422, { age: "must be at least 5" }),
    );

    await submit(result);

    expect(result.current.error).toBe("Validation failed");
    expect(result.current.fieldErrors).toEqual({ age: "must be at least 5" });
  });

  it("swallows an auth-redirect error on submit without setting an error message", async () => {
    const result = await loadWith(null);
    protectedFrontFetch.mockRejectedValueOnce(new AuthRedirectError());

    await submit(result);

    expect(result.current.error).toBe("");
  });
});
