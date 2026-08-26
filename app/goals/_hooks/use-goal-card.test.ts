import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Goal } from "@/app/goals/_data/goals";
import { useGoalCard } from "@/app/goals/_hooks/use-goal-card";

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

function setUp(goal: Goal = activeGoal) {
  const onSaved = vi.fn();
  const onDeactivated = vi.fn();
  const { result } = renderHook(() => useGoalCard(goal, onSaved, onDeactivated));
  return { result, onSaved, onDeactivated };
}

async function submit(fn: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void> | void) {
  await act(async () => {
    await fn({ preventDefault: () => {} } as React.SubmitEvent<HTMLFormElement>);
  });
}

describe("useGoalCard", () => {
  afterEach(() => vi.clearAllMocks());

  it("starts in view mode", () => {
    const { result } = setUp();
    expect(result.current.mode).toBe("view");
  });

  describe("edit flow", () => {
    it("prefills the edit text and switches to edit mode on start", () => {
      const { result } = setUp();
      act(() => result.current.edit.start());

      expect(result.current.mode).toBe("edit");
      expect(result.current.edit.text).toBe(activeGoal.text);
    });

    it("returns to view mode on cancel", () => {
      const { result } = setUp();
      act(() => result.current.edit.start());
      act(() => result.current.edit.cancel());

      expect(result.current.mode).toBe("view");
    });

    it("saves via PATCH /goals/api/{id}, calls onSaved, and returns to view mode", async () => {
      const updated = { ...activeGoal, text: "Updated text" };
      protectedFrontFetch.mockResolvedValue(updated);
      const { result, onSaved } = setUp();
      act(() => result.current.edit.start());
      act(() => result.current.edit.setText("Updated text"));

      await submit(result.current.edit.submit);

      expect(protectedFrontFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: "Updated text" }),
      });
      expect(onSaved).toHaveBeenCalledWith(updated);
      expect(result.current.mode).toBe("view");
    });

    it("sets an edit error and stays in edit mode when the save fails", async () => {
      protectedFrontFetch.mockRejectedValue(new Error("boom"));
      const { result, onSaved } = setUp();
      act(() => result.current.edit.start());

      await submit(result.current.edit.submit);

      expect(result.current.edit.error).toBe("Failed to save goal. Please try again.");
      expect(result.current.mode).toBe("edit");
      expect(onSaved).not.toHaveBeenCalled();
    });
  });

  describe("deactivate flow", () => {
    it("resets the reason and switches to deactivate mode on start", () => {
      const { result } = setUp();
      act(() => result.current.deactivate.start());

      expect(result.current.mode).toBe("deactivate");
      expect(result.current.deactivate.reason).toBe("");
    });

    it("returns to view mode on cancel", () => {
      const { result } = setUp();
      act(() => result.current.deactivate.start());
      act(() => result.current.deactivate.cancel());

      expect(result.current.mode).toBe("view");
    });

    it("deactivates via PATCH /goals/api/{id}/deactivate, calls onDeactivated, and returns to view mode", async () => {
      const deactivated = {
        ...activeGoal,
        is_active: false,
        deactivation_reason: "reached" as const,
      };
      protectedFrontFetch.mockResolvedValue(deactivated);
      const { result, onDeactivated } = setUp();
      act(() => result.current.deactivate.start());
      act(() => result.current.deactivate.setReason("reached"));

      await submit(result.current.deactivate.confirm);

      expect(protectedFrontFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "reached" }),
      });
      expect(onDeactivated).toHaveBeenCalledWith(deactivated);
      expect(result.current.mode).toBe("view");
    });

    it("sets a deactivate error and stays in deactivate mode when it fails", async () => {
      protectedFrontFetch.mockRejectedValue(new Error("boom"));
      const { result, onDeactivated } = setUp();
      act(() => result.current.deactivate.start());
      act(() => result.current.deactivate.setReason("reached"));

      await submit(result.current.deactivate.confirm);

      expect(result.current.deactivate.error).toBe("Failed to deactivate goal. Please try again.");
      expect(result.current.mode).toBe("deactivate");
      expect(onDeactivated).not.toHaveBeenCalled();
    });
  });
});
