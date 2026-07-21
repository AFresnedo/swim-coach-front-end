import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoalCard from "@/app/goals/_components/GoalCard";
import type { Goal } from "@/app/goals/_components/GoalsList";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

const activeGoal: Goal = {
  id: 1,
  user_id: 1,
  text: "Swim a sub-1:00 100m free",
  is_active: true,
  deactivation_reason: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("GoalCard", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows Edit and Deactivate buttons for an active goal", () => {
    render(<GoalCard goal={activeGoal} onSaved={vi.fn()} onDeactivated={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeInTheDocument();
  });

  it("shows the deactivation reason label for an inactive goal", () => {
    render(
      <GoalCard
        goal={{ ...activeGoal, is_active: false, deactivation_reason: "reached" }}
        onSaved={vi.fn()}
        onDeactivated={vi.fn()}
      />,
    );
    expect(screen.getByText(/deactivated.*reached/i)).toBeInTheDocument();
  });

  it("falls back to 'Unknown' when an inactive goal has no deactivation reason", () => {
    render(
      <GoalCard
        goal={{ ...activeGoal, is_active: false, deactivation_reason: null }}
        onSaved={vi.fn()}
        onDeactivated={vi.fn()}
      />,
    );
    expect(screen.getByText(/deactivated.*unknown/i)).toBeInTheDocument();
  });

  it("saves an edit via PATCH /goals/api/{id} and calls onSaved", async () => {
    const onSaved = vi.fn();
    const updated = { ...activeGoal, text: "Updated goal text" };
    protectedFrontFetch.mockResolvedValue(updated);
    render(<GoalCard goal={activeGoal} onSaved={onSaved} onDeactivated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Edit goal"), {
      target: { value: "Updated goal text" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form") as HTMLFormElement,
    );

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: "Updated goal text" }),
      }),
    );
    expect(onSaved).toHaveBeenCalledWith(updated);
  });

  it("shows an edit error instead of calling onSaved when the save fails", async () => {
    const onSaved = vi.fn();
    protectedFrontFetch.mockRejectedValue(new Error("boom"));
    render(<GoalCard goal={activeGoal} onSaved={onSaved} onDeactivated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form") as HTMLFormElement,
    );

    expect(await screen.findByText("Failed to save goal. Please try again.")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("cancels an edit without saving", () => {
    render(<GoalCard goal={activeGoal} onSaved={vi.fn()} onDeactivated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByLabelText("Edit goal")).not.toBeInTheDocument();
    expect(protectedFrontFetch).not.toHaveBeenCalled();
  });

  it("deactivates a goal via PATCH /goals/api/{id}/deactivate and calls onDeactivated", async () => {
    const onDeactivated = vi.fn();
    const deactivated = { ...activeGoal, is_active: false, deactivation_reason: "reached" };
    protectedFrontFetch.mockResolvedValue(deactivated);
    render(<GoalCard goal={activeGoal} onSaved={vi.fn()} onDeactivated={onDeactivated} />);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "reached" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "reached" }),
      }),
    );
    expect(onDeactivated).toHaveBeenCalledWith(deactivated);
  });

  it("shows a deactivate error instead of calling onDeactivated when it fails", async () => {
    const onDeactivated = vi.fn();
    protectedFrontFetch.mockRejectedValue(new Error("boom"));
    render(<GoalCard goal={activeGoal} onSaved={vi.fn()} onDeactivated={onDeactivated} />);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "reached" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("Failed to deactivate goal. Please try again."),
    ).toBeInTheDocument();
    expect(onDeactivated).not.toHaveBeenCalled();
  });
});
