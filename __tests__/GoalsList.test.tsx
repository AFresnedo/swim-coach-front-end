import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoalsList from "@/app/goals/_components/GoalsList";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
// A stable object, matching real next/navigation's useRouter, since
// GoalsList depends on the protected-fetch function's identity in a
// useEffect dependency array — a fresh object per call would refire it.
const router = { push, replace, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/shared/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/shared/front-api";

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

const secondActiveGoal = {
  id: 3,
  user_id: 1,
  text: "Swim 200 IM under 3 minutes",
  is_active: true,
  deactivation_reason: null,
  created_at: "2026-01-03T00:00:00Z",
};

describe("GoalsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("fetches active goals by default", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/goals/api?status=active", {
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("shows empty state when there are no active goals", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    expect(await screen.findByText(/no active goals yet/i)).toBeInTheDocument();
  });

  it("refetches with status=all when the All filter is selected", async () => {
    mockFetch.mockResolvedValue([]);
    render(<GoalsList />);
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/goals/api?status=active", {
        signal: expect.any(AbortSignal),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/goals/api?status=all", {
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("renders active and inactive goals differently", async () => {
    mockFetch.mockResolvedValue([activeGoal, inactiveGoal]);
    render(<GoalsList />);

    expect(await screen.findByText(activeGoal.text)).toBeInTheDocument();
    expect(screen.getByText(inactiveGoal.text)).toBeInTheDocument();
    expect(screen.getByText(/deactivated.*reached/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Deactivate" })).toHaveLength(1);
  });

  it("submits a new goal via POST /goals/api", async () => {
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
      expect(mockFetch).toHaveBeenCalledWith("/goals/api", {
        method: "POST",
        body: JSON.stringify({ text: "Swim 200 IM under 3 minutes" }),
      }),
    );
    expect(await screen.findByText("Swim 200 IM under 3 minutes")).toBeInTheDocument();
  });

  it("edits a goal via PATCH /goals/api/{id}", async () => {
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
      expect(mockFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: "Updated goal text" }),
      }),
    );
    expect(await screen.findByText("Updated goal text")).toBeInTheDocument();
  });

  it("allows editing two goals independently at the same time", async () => {
    mockFetch.mockResolvedValueOnce([activeGoal, secondActiveGoal]);
    render(<GoalsList />);
    await screen.findByText(activeGoal.text);
    await screen.findByText(secondActiveGoal.text);

    const cardA = screen.getByTestId(`goal-card-${activeGoal.id}`);
    const cardB = screen.getByTestId(`goal-card-${secondActiveGoal.id}`);

    fireEvent.click(within(cardA).getByRole("button", { name: "Edit" }));
    fireEvent.click(within(cardB).getByRole("button", { name: "Edit" }));

    expect(within(cardA).getByLabelText("Edit goal")).toHaveValue(activeGoal.text);
    expect(within(cardB).getByLabelText("Edit goal")).toHaveValue(secondActiveGoal.text);

    mockFetch.mockResolvedValueOnce({ ...activeGoal, text: "Updated goal A" });
    fireEvent.change(within(cardA).getByLabelText("Edit goal"), {
      target: { value: "Updated goal A" },
    });
    // biome-ignore lint/style/noNonNullAssertion: form always exists in these tests
    fireEvent.submit(within(cardA).getByRole("button", { name: "Save" }).closest("form")!);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: "Updated goal A" }),
      }),
    );
    expect(await within(cardA).findByText("Updated goal A")).toBeInTheDocument();
    // Card B's independent edit session was untouched by card A's save.
    expect(within(cardB).getByLabelText("Edit goal")).toHaveValue(secondActiveGoal.text);
  });

  it("requires a reason before confirming deactivation, then submits PATCH /goals/api/{id}/deactivate", async () => {
    mockFetch.mockResolvedValueOnce([activeGoal]);
    render(<GoalsList />);
    await screen.findByText(activeGoal.text);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    fireEvent.click(confirmButton);
    expect(mockFetch).not.toHaveBeenCalledWith(
      `/goals/api/${activeGoal.id}/deactivate`,
      expect.anything(),
    );

    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "reached" } });

    mockFetch.mockResolvedValueOnce({
      ...activeGoal,
      is_active: false,
      deactivation_reason: "reached",
    });
    fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`/goals/api/${activeGoal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "reached" }),
      }),
    );
    await waitFor(() => expect(screen.queryByText(activeGoal.text)).not.toBeInTheDocument());
  });

  it("shows an error message when loading goals fails", async () => {
    mockFetch.mockRejectedValue(new ApiError("Server error", 500));
    render(<GoalsList />);
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("redirects to sign-in instead of showing an error when the session has expired", async () => {
    mockFetch.mockRejectedValue(new ApiError("Could not validate credentials", 401));
    render(<GoalsList />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in?sessionExpired=1"));
    expect(screen.queryByText("Could not validate credentials")).not.toBeInTheDocument();
  });

  it("does not redirect if a stale request resolves with 401 after the component has unmounted", async () => {
    let rejectFetch: (err: unknown) => void = () => {};
    mockFetch.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectFetch = reject;
      }),
    );
    const { unmount } = render(<GoalsList />);
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/goals/api?status=active", {
        signal: expect.any(AbortSignal),
      }),
    );

    unmount();
    rejectFetch(new ApiError("Could not validate credentials", 401));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(replace).not.toHaveBeenCalled();
  });
});
