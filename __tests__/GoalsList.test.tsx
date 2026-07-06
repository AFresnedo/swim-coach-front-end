import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoalsList from "@/components/GoalsList";

vi.mock("@/lib/api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/lib/api";

const mockFetch = vi.mocked(frontApiFetch);

// Waits for pending promise continuations (state updates from a resolved
// mock fetch) to actually land, wrapped in act(), before the test proceeds.
// The call count itself is already true the instant it's called — awaiting
// it is what matters, not the specific condition it polls.
async function settleAsyncEffects(expectedCallCount: number) {
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(expectedCallCount));
}

const activeGoal = {
  id: 1,
  user_id: 1,
  text: "Swim a sub-1:00 100m free",
  is_active: true,
  deactivation_reason: null,
  created_at: "2026-01-01T00:00:00Z",
};

const inactiveGoal = {
  id: 2,
  user_id: 1,
  text: "Old goal",
  is_active: false,
  deactivation_reason: "reached",
  created_at: "2026-01-02T00:00:00Z",
};

describe("GoalsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("fetches active goals by default", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("/api/goals?status=active"));
  });

  it("shows empty state when there are no active goals", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    expect(await screen.findByText(/no active goals yet/i)).toBeDefined();
  });

  it("refetches with status=all when the All filter is selected", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("/api/goals?status=active"));

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith("/api/goals?status=all"));
  });

  it("renders active and inactive goals differently", async () => {
    mockFetch.mockResolvedValue([activeGoal, inactiveGoal]);
    render(<GoalsList />);

    expect(await screen.findByText(activeGoal.text)).toBeDefined();
    expect(screen.getByText(inactiveGoal.text)).toBeDefined();
    expect(screen.getByText(/deactivated.*reached/i)).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Deactivate" })).toHaveLength(1);
  });

  it("submits a new goal via POST /api/goals", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(<GoalsList />);
    await settleAsyncEffects(1);

    mockFetch.mockResolvedValueOnce({ ...activeGoal, id: 3, text: "Swim 200 IM under 3 minutes" });
    fireEvent.change(screen.getByLabelText("New goal"), {
      target: { value: "Swim 200 IM under 3 minutes" },
    });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: "Add goal" }).closest("form")!);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/goals", {
        method: "POST",
        body: JSON.stringify({ text: "Swim 200 IM under 3 minutes" }),
      }),
    );
    expect(await screen.findByText("Swim 200 IM under 3 minutes")).toBeDefined();
  });

  it("edits a goal via PATCH /api/goals/{id}", async () => {
    mockFetch.mockResolvedValueOnce([activeGoal]);
    render(<GoalsList />);
    await screen.findByText(activeGoal.text);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    mockFetch.mockResolvedValueOnce({ ...activeGoal, text: "Updated goal text" });

    fireEvent.change(screen.getByLabelText("Edit goal"), {
      target: { value: "Updated goal text" },
    });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${activeGoal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: "Updated goal text" }),
      }),
    );
    expect(await screen.findByText("Updated goal text")).toBeDefined();
  });

  it("requires a reason before confirming deactivation, then submits PATCH /api/goals/{id}/deactivate", async () => {
    mockFetch.mockResolvedValueOnce([activeGoal]);
    render(<GoalsList />);
    await screen.findByText(activeGoal.text);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "reached" } });
    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);

    mockFetch.mockResolvedValueOnce({
      ...activeGoal,
      is_active: false,
      deactivation_reason: "reached",
    });
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${activeGoal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "reached" }),
      }),
    );
    await waitFor(() => expect(screen.queryByText(activeGoal.text)).toBeNull());
  });

  it("shows an error message when loading goals fails", async () => {
    mockFetch.mockRejectedValue(new ApiError("Server error"));
    render(<GoalsList />);
    expect(await screen.findByText("Server error")).toBeDefined();
  });
});
