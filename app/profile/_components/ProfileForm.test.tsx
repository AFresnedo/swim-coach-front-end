import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm from "@/app/profile/_components/ProfileForm";

const { hookState } = vi.hoisted(() => ({
  hookState: {} as Record<string, unknown>,
}));

vi.mock("@/app/profile/_hooks/use-profile-form", () => ({
  useProfileForm: () => hookState,
}));

function renderForm() {
  render(<ProfileForm />);
}

describe("ProfileForm", () => {
  beforeEach(() => {
    Object.assign(hookState, {
      units: "metric",
      setUnits: vi.fn(),
      age: "",
      setAge: vi.fn(),
      heightCm: "",
      setHeightCm: vi.fn(),
      heightFt: "",
      setHeightFt: vi.fn(),
      heightIn: "",
      setHeightIn: vi.fn(),
      weightKg: "",
      setWeightKg: vi.fn(),
      weightLbs: "",
      setWeightLbs: vi.fn(),
      sex: "",
      setSex: vi.fn(),
      loadingProfile: false,
      error: "",
      fieldErrors: {},
      loading: false,
      saved: false,
      handleSubmit: vi.fn((e: React.SubmitEvent<HTMLFormElement>) => e.preventDefault()),
    });
  });

  afterEach(cleanup);

  it("renders metric inputs when units is metric", () => {
    renderForm();
    expect(screen.getByPlaceholderText("cm")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("kg")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("ft")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("lbs")).not.toBeInTheDocument();
  });

  it("renders imperial inputs when units is imperial", () => {
    hookState.units = "imperial";
    renderForm();
    expect(screen.getByPlaceholderText("ft")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("in")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("lbs")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("cm")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("kg")).not.toBeInTheDocument();
  });

  it("forwards the unit toggle clicks to setUnits", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /imperial/i }));
    expect(hookState.setUnits).toHaveBeenCalledWith("imperial");

    fireEvent.click(screen.getByRole("button", { name: /metric/i }));
    expect(hookState.setUnits).toHaveBeenCalledWith("metric");
  });

  it("forwards metric field changes to the hook's setters", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Age"), { target: { value: "25" } });
    expect(hookState.setAge).toHaveBeenCalledWith("25");

    fireEvent.change(screen.getByPlaceholderText("cm"), { target: { value: "175" } });
    expect(hookState.setHeightCm).toHaveBeenCalledWith("175");

    fireEvent.change(screen.getByPlaceholderText("kg"), { target: { value: "70" } });
    expect(hookState.setWeightKg).toHaveBeenCalledWith("70");

    fireEvent.change(screen.getByLabelText("Sex"), { target: { value: "male" } });
    expect(hookState.setSex).toHaveBeenCalledWith("male");
  });

  it("forwards imperial field changes to the hook's setters", () => {
    hookState.units = "imperial";
    renderForm();
    fireEvent.change(screen.getByPlaceholderText("ft"), { target: { value: "5" } });
    expect(hookState.setHeightFt).toHaveBeenCalledWith("5");

    fireEvent.change(screen.getByPlaceholderText("in"), { target: { value: "10" } });
    expect(hookState.setHeightIn).toHaveBeenCalledWith("10");

    fireEvent.change(screen.getByPlaceholderText("lbs"), { target: { value: "154" } });
    expect(hookState.setWeightLbs).toHaveBeenCalledWith("154");
  });

  it("shows a loading message while loadingProfile is true", () => {
    hookState.loadingProfile = true;
    renderForm();
    expect(screen.getByText("Loading your profile…")).toBeInTheDocument();
  });

  it("shows the error message when error is set", () => {
    hookState.error = "Failed to load your profile. Please try again.";
    renderForm();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load your profile. Please try again.",
    );
  });

  it("shows 'Profile saved.' when saved is true", () => {
    hookState.saved = true;
    renderForm();
    expect(screen.getByText("Profile saved.")).toBeInTheDocument();
  });

  it("disables the submit button and shows 'Saving…' while loading", () => {
    hookState.loading = true;
    renderForm();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("maps field-level errors onto the corresponding inputs", () => {
    hookState.fieldErrors = {
      age: "must be at least 5",
      height_cm: "must be at least 50",
      weight_kg: "must be at least 20",
      sex: "required",
    };
    renderForm();
    expect(screen.getByText("must be at least 5")).toBeInTheDocument();
    expect(screen.getByText("must be at least 50")).toBeInTheDocument();
    expect(screen.getByText("must be at least 20")).toBeInTheDocument();
    expect(screen.getByText("required")).toBeInTheDocument();
  });

  it("submits the form via the hook's handleSubmit", () => {
    renderForm();
    fireEvent.submit(
      screen.getByRole("button", { name: /save profile/i }).closest("form") as HTMLFormElement,
    );
    expect(hookState.handleSubmit).toHaveBeenCalled();
  });
});
