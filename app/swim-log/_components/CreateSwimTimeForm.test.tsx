import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateSwimTimeForm from "@/app/swim-log/_components/CreateSwimTimeForm";

const { hookState } = vi.hoisted(() => ({
  hookState: {} as Record<string, unknown>,
}));

vi.mock("@/app/swim-log/_hooks/use-create-swim-time-form", () => ({
  useCreateSwimTimeForm: () => hookState,
}));

function renderForm() {
  render(
    <CreateSwimTimeForm
      selectedDate="2026-01-01"
      getViewGeneration={() => 0}
      insertIfCurrentView={vi.fn()}
    />,
  );
}

describe("CreateSwimTimeForm", () => {
  beforeEach(() => {
    Object.assign(hookState, {
      stroke: "freestyle",
      setStroke: vi.fn(),
      course: "scy",
      setCourse: vi.fn(),
      length: "",
      setLength: vi.fn(),
      timeText: "",
      setTimeText: vi.fn(),
      attemptNumber: "1",
      setAttemptNumber: vi.fn(),
      notes: "",
      setNotes: vi.fn(),
      isOfficial: false,
      setIsOfficial: vi.fn(),
      creating: false,
      createError: "",
      createFieldErrors: {},
      handleCreate: vi.fn((e: React.SubmitEvent<HTMLFormElement>) => e.preventDefault()),
    });
  });

  afterEach(cleanup);

  it("renders all fields and forwards field changes to the hook's setters", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Stroke"), { target: { value: "backstroke" } });
    expect(hookState.setStroke).toHaveBeenCalledWith("backstroke");

    fireEvent.change(screen.getByLabelText("Length"), { target: { value: "50" } });
    expect(hookState.setLength).toHaveBeenCalledWith("50");

    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "1:02.35" } });
    expect(hookState.setTimeText).toHaveBeenCalledWith("1:02.35");

    fireEvent.click(screen.getByLabelText("Official time"));
    expect(hookState.setIsOfficial).toHaveBeenCalledWith(true);
  });

  it("submits the form via the hook's handleCreate", () => {
    renderForm();

    fireEvent.submit(
      screen.getByRole("button", { name: "Log time" }).closest("form") as HTMLFormElement,
    );

    expect(hookState.handleCreate).toHaveBeenCalled();
  });

  it("shows the general error message when createError is set", () => {
    hookState.createError = "Failed to log time. Please try again.";
    renderForm();

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to log time. Please try again.");
  });

  it("maps field-level errors onto the corresponding input", () => {
    hookState.createFieldErrors = { length: "must be positive" };
    renderForm();

    expect(screen.getByText("must be positive")).toBeInTheDocument();
  });

  it("disables the submit button and shows a loading label while creating", () => {
    hookState.creating = true;
    renderForm();

    expect(screen.getByRole("button", { name: "Logging…" })).toBeDisabled();
  });
});
