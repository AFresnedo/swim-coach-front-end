import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Goal } from "@/app/goals/_data/goals";
import { useGoalsList } from "@/app/goals/_hooks/use-goals-list";
import { ApiError } from "@/shared/front-api";
import { AuthRedirectError } from "@/shared/protected-fetch";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

const baseGoal: Goal = {
  id: 1,
  user_id: 1,
  text: "Swim a sub-1:00 100m free",
  is_active: true,
  deactivation_reason: null,
  created_at: "2026-01-01T00:00:00Z",
};

async function renderLoaded(initialGoals: Goal[] = []) {
  protectedFrontFetch.mockResolvedValueOnce(initialGoals);
  const { result } = renderHook(() => useGoalsList());
  await waitFor(() => expect(result.current.goals).toEqual(initialGoals));
  return result;
}

describe("useGoalsList", () => {
  afterEach(() => vi.clearAllMocks());

  it("fetches active goals on first render", async () => {
    protectedFrontFetch.mockResolvedValue([]);
    renderHook(() => useGoalsList());

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith("/goals/api?status=active", {
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("refetches with the new filter when it changes", async () => {
    const result = await renderLoaded();

    act(() => result.current.setFilter("all"));

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith("/goals/api?status=all", {
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("sets an error message when the fetch fails", async () => {
    protectedFrontFetch.mockRejectedValue(new ApiError("Server error", 500));
    const { result } = renderHook(() => useGoalsList());

    await waitFor(() => expect(result.current.error).toBe("Server error"));
  });

  it("does not set an error message when the failure is an auth redirect", async () => {
    protectedFrontFetch.mockRejectedValue(new AuthRedirectError());
    const { result } = renderHook(() => useGoalsList());

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.error).toBe("");
  });

  describe("handleGoalCreated", () => {
    it("prepends the created goal", async () => {
      const result = await renderLoaded();

      act(() => result.current.handleGoalCreated(baseGoal));

      expect(result.current.goals).toEqual([baseGoal]);
    });
  });

  describe("handleGoalSaved", () => {
    it("updates the matching goal in place", async () => {
      const result = await renderLoaded([baseGoal]);

      const updated = { ...baseGoal, text: "Updated text" };
      act(() => result.current.handleGoalSaved(updated));

      expect(result.current.goals).toEqual([updated]);
    });
  });

  describe("handleGoalDeactivated", () => {
    it("removes the goal from the list when viewing active goals", async () => {
      const result = await renderLoaded([baseGoal]);

      const deactivated = {
        ...baseGoal,
        is_active: false,
        deactivation_reason: "reached" as const,
      };
      act(() => result.current.handleGoalDeactivated(deactivated));

      expect(result.current.goals).toEqual([]);
    });

    it("updates the goal in place when viewing all goals", async () => {
      const result = await renderLoaded([baseGoal]);

      act(() => result.current.setFilter("all"));
      protectedFrontFetch.mockResolvedValueOnce([baseGoal]);
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(2));

      const deactivated = {
        ...baseGoal,
        is_active: false,
        deactivation_reason: "reached" as const,
      };
      act(() => result.current.handleGoalDeactivated(deactivated));

      expect(result.current.goals).toEqual([deactivated]);
    });
  });
});
