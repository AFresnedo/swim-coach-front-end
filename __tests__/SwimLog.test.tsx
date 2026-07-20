import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SwimLog from "@/features/swim-log/components/SwimLog";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
// A stable object, matching real next/navigation's useRouter, since
// SwimLog depends on the protected-fetch function's identity in a
// useEffect dependency array — a fresh object per call would refire it.
const router = { push, replace, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/front-api")>();
  return { ...actual, frontApiFetch: vi.fn() };
});

import { ApiError, frontApiFetch } from "@/lib/front-api";

const mockFetch = vi.mocked(frontApiFetch);

// Waits for pending promise continuations (state updates from a resolved
// mock fetch) to actually land, wrapped in act(), before the test proceeds.
async function settleAsyncEffects(expectedCallCount: number) {
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(expectedCallCount));
}

function currentDateInputValue(): string {
  return (screen.getByLabelText("Date") as HTMLInputElement).value;
}

const loggedTime = {
  id: 1,
  user_id: 1,
  date: "2026-01-01",
  stroke: "freestyle",
  course: "scy",
  length: 50,
  attempt_number: 1,
  time_seconds: 32.1,
  is_official: false,
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("SwimLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("fetches times for today's date by default", async () => {
    mockFetch.mockResolvedValue({ items: [], next_cursor: null });
    render(<SwimLog />);
    const today = currentDateInputValue();
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(`/api/swim-times?date_from=${today}&date_to=${today}`),
    );
  });

  it("shows empty state when there are no times for the selected date", async () => {
    mockFetch.mockResolvedValue({ items: [], next_cursor: null });
    render(<SwimLog />);
    expect(await screen.findByText(/no times logged for this date yet/i)).toBeInTheDocument();
  });

  it("refetches when the date changes", async () => {
    mockFetch.mockResolvedValue({ items: [], next_cursor: null });
    render(<SwimLog />);
    await settleAsyncEffects(1);

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-02-14" } });
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/swim-times?date_from=2026-02-14&date_to=2026-02-14",
      ),
    );
  });

  it("renders fetched times in the table", async () => {
    mockFetch.mockResolvedValue({ items: [loggedTime], next_cursor: null });
    render(<SwimLog />);

    expect(await screen.findByRole("cell", { name: "Freestyle" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "SCY (short course yards)" })).toBeInTheDocument();
    expect(screen.getByText("0:32.10")).toBeInTheDocument();
  });

  it("submits a new time via POST /api/swim-times with time parsed from mm:ss", async () => {
    mockFetch.mockResolvedValueOnce({ items: [], next_cursor: null });
    render(<SwimLog />);
    await settleAsyncEffects(1);
    const today = currentDateInputValue();

    fireEvent.change(screen.getByLabelText("Length"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "1:02.35" } });

    mockFetch.mockResolvedValueOnce({ ...loggedTime, id: 2, date: today, time_seconds: 62.35 });
    fireEvent.submit(
      screen.getByRole("button", { name: "Log time" }).closest("form") as HTMLFormElement,
    );

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/swim-times", {
        method: "POST",
        body: JSON.stringify({
          date: today,
          stroke: "freestyle",
          course: "scy",
          length: 50,
          attempt_number: 1,
          time_seconds: 62.35,
          is_official: false,
          notes: null,
        }),
      }),
    );
    expect(await screen.findByText("1:02.35")).toBeInTheDocument();
  });

  it("shows a validation error for invalid time input without calling POST", async () => {
    mockFetch.mockResolvedValueOnce({ items: [], next_cursor: null });
    render(<SwimLog />);
    await settleAsyncEffects(1);

    fireEvent.change(screen.getByLabelText("Length"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "not-a-time" } });
    fireEvent.submit(
      screen.getByRole("button", { name: "Log time" }).closest("form") as HTMLFormElement,
    );

    expect(await screen.findByText(/enter a valid time/i)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when loading times fails", async () => {
    mockFetch.mockRejectedValue(new ApiError("Server error", 500));
    render(<SwimLog />);
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("redirects to sign-in instead of showing an error when the session has expired", async () => {
    mockFetch.mockRejectedValue(new ApiError("Could not validate credentials", 401));
    render(<SwimLog />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in?sessionExpired=1"));
    expect(screen.queryByText("Could not validate credentials")).not.toBeInTheDocument();
  });

  it("refetches with stroke/course/length/official filters applied", async () => {
    mockFetch.mockResolvedValue({ items: [], next_cursor: null });
    render(<SwimLog />);
    const today = currentDateInputValue();
    await settleAsyncEffects(1);

    fireEvent.change(screen.getByLabelText("Filter by stroke"), {
      target: { value: "backstroke" },
    });
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}&stroke=backstroke`,
      ),
    );

    fireEvent.change(screen.getByLabelText("Filter by course"), { target: { value: "lcm" } });
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}&stroke=backstroke&course=lcm`,
      ),
    );

    fireEvent.change(screen.getByLabelText("Filter by length"), { target: { value: "100" } });
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}&stroke=backstroke&course=lcm&length=100`,
      ),
    );

    fireEvent.change(screen.getByLabelText("Filter by official status"), {
      target: { value: "true" },
    });
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}&stroke=backstroke&course=lcm&length=100&is_official=true`,
      ),
    );
  });

  it("shows a Clear filters button only while a filter is active, and resets on click", async () => {
    mockFetch.mockResolvedValue({ items: [], next_cursor: null });
    render(<SwimLog />);
    const today = currentDateInputValue();
    await settleAsyncEffects(1);

    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter by stroke"), {
      target: { value: "backstroke" },
    });
    await settleAsyncEffects(2);
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() =>
      expect(mockFetch).toHaveBeenLastCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}`,
      ),
    );
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("does not add a newly created time to the table when it doesn't match the active filter", async () => {
    mockFetch.mockResolvedValueOnce({ items: [], next_cursor: null });
    render(<SwimLog />);
    await settleAsyncEffects(1);

    fireEvent.change(screen.getByLabelText("Filter by stroke"), {
      target: { value: "backstroke" },
    });
    await settleAsyncEffects(2);

    fireEvent.change(screen.getByLabelText("Length"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "0:32.10" } });

    // The entry form defaults to freestyle, but the active filter is backstroke.
    mockFetch.mockResolvedValueOnce({ ...loggedTime, id: 3, stroke: "freestyle" });
    fireEvent.submit(
      screen.getByRole("button", { name: "Log time" }).closest("form") as HTMLFormElement,
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    expect(screen.queryByText("0:32.10")).not.toBeInTheDocument();
  });

  it("shows a Load more button when next_cursor is present, and appends the next page", async () => {
    mockFetch.mockResolvedValueOnce({ items: [loggedTime], next_cursor: "abc123" });
    render(<SwimLog />);
    const today = currentDateInputValue();

    await screen.findByText("0:32.10");
    expect(screen.getByRole("button", { name: "Load more" })).toBeInTheDocument();

    mockFetch.mockResolvedValueOnce({
      items: [{ ...loggedTime, id: 2, notes: "second page" }],
      next_cursor: null,
    });
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/swim-times?date_from=${today}&date_to=${today}&cursor=abc123`,
      ),
    );
    expect(await screen.findByText("second page")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });
});
