import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoalCard from "@/app/goals/_components/GoalCard";
import type { Goal } from "@/app/goals/_data/goals";
import type { useGoalCard } from "@/app/goals/_hooks/use-goal-card";

const { hookState } = vi.hoisted(() => ({
  hookState: {} as ReturnType<typeof useGoalCard>,
}));

vi.mock("@/app/goals/_hooks/use-goal-card", () => ({
  useGoalCard: () => hookState,
}));

const activeGoal: Goal = {
  id: 1,
  user_id: 1,
  text: "Swim a sub-1:00 100m free",
  is_active: true,
  deactivation_reason: null,
  created_at: "2026-01-01T00:00:00Z",
};

function renderCard(goal: Goal = activeGoal) {
  render(<GoalCard goal={goal} onSaved={vi.fn()} onDeactivated={vi.fn()} />);
}

describe("GoalCard", () => {
  beforeEach(() => {
    Object.assign(hookState, {
      mode: "view",
      edit: {
        text: activeGoal.text,
        setText: vi.fn(),
        saving: false,
        error: "",
        start: vi.fn(),
        cancel: vi.fn(),
        submit: vi.fn((e: React.SubmitEvent<HTMLFormElement>) => e.preventDefault()),
      },
      deactivate: {
        reason: "",
        setReason: vi.fn(),
        saving: false,
        error: "",
        start: vi.fn(),
        cancel: vi.fn(),
        confirm: vi.fn((e: React.SubmitEvent<HTMLFormElement>) => e.preventDefault()),
      },
    });
  });

  afterEach(cleanup);

  it("shows Edit and Deactivate buttons for an active goal in view mode", () => {
    renderCard();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeInTheDocument();
  });

  it("forwards Edit and Deactivate clicks to the hook's start handlers", () => {
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(hookState.edit.start).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(hookState.deactivate.start).toHaveBeenCalled();
  });

  it("shows the deactivation reason label for an inactive goal", () => {
    renderCard({ ...activeGoal, is_active: false, deactivation_reason: "reached" });
    expect(screen.getByText(/deactivated.*reached/i)).toBeInTheDocument();
  });

  it("falls back to 'Unknown' when an inactive goal has no deactivation reason", () => {
    renderCard({ ...activeGoal, is_active: false, deactivation_reason: null });
    expect(screen.getByText(/deactivated.*unknown/i)).toBeInTheDocument();
  });

  describe("edit mode", () => {
    beforeEach(() => {
      hookState.mode = "edit";
    });

    it("renders the edit form and forwards changes to the hook's setter", () => {
      renderCard();
      fireEvent.change(screen.getByLabelText("Edit goal"), { target: { value: "New text" } });
      expect(hookState.edit.setText).toHaveBeenCalledWith("New text");
    });

    it("submits via the hook's submit handler", () => {
      renderCard();
      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form") as HTMLFormElement,
      );
      expect(hookState.edit.submit).toHaveBeenCalled();
    });

    it("cancels via the hook's cancel handler", () => {
      renderCard();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(hookState.edit.cancel).toHaveBeenCalled();
    });

    it("shows the edit error and disables the button while saving", () => {
      hookState.edit.error = "Failed to save goal. Please try again.";
      hookState.edit.saving = true;
      renderCard();
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to save goal. Please try again.");
      expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    });
  });

  describe("deactivate mode", () => {
    beforeEach(() => {
      hookState.mode = "deactivate";
    });

    it("renders the deactivate form and forwards the reason change to the hook's setter", () => {
      renderCard();
      fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "reached" } });
      expect(hookState.deactivate.setReason).toHaveBeenCalledWith("reached");
    });

    it("confirms via the hook's confirm handler", () => {
      renderCard();
      fireEvent.submit(
        screen.getByRole("button", { name: "Confirm" }).closest("form") as HTMLFormElement,
      );
      expect(hookState.deactivate.confirm).toHaveBeenCalled();
    });

    it("cancels via the hook's cancel handler", () => {
      renderCard();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(hookState.deactivate.cancel).toHaveBeenCalled();
    });

    it("shows the deactivate error and disables the button while saving", () => {
      hookState.deactivate.error = "Failed to deactivate goal. Please try again.";
      hookState.deactivate.saving = true;
      renderCard();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to deactivate goal. Please try again.",
      );
      expect(screen.getByRole("button", { name: "Deactivating…" })).toBeDisabled();
    });
  });
});
