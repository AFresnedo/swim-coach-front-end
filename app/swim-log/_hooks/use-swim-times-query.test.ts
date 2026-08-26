import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SwimTime } from "@/app/swim-log/_data/swim-times";
import { useSwimTimesQuery } from "@/app/swim-log/_hooks/use-swim-times-query";
import { ApiError } from "@/shared/front-api";
import { AuthRedirectError } from "@/shared/protected-fetch";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

const emptyPage = { items: [], next_cursor: null };

const baseSwimTime: SwimTime = {
  id: 9,
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

describe("useSwimTimesQuery", () => {
  afterEach(() => vi.clearAllMocks());

  it("fetches the selected date's range on first render", async () => {
    protectedFrontFetch.mockResolvedValue(emptyPage);
    renderHook(() => useSwimTimesQuery("2026-01-01"));

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith(
        "/swim-log/api?date_from=2026-01-01&date_to=2026-01-01",
        { signal: expect.any(AbortSignal) },
      ),
    );
  });

  it("refetches with the stroke filter applied when it changes", async () => {
    protectedFrontFetch.mockResolvedValue(emptyPage);
    const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
    await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(1));

    act(() => result.current.filters.setFilterStroke("backstroke"));

    await waitFor(() =>
      expect(protectedFrontFetch).toHaveBeenCalledWith(
        "/swim-log/api?date_from=2026-01-01&date_to=2026-01-01&stroke=backstroke",
        { signal: expect.any(AbortSignal) },
      ),
    );
  });

  it("skips the fetch and clears results while the length filter is invalid", async () => {
    vi.useFakeTimers();
    try {
      protectedFrontFetch.mockResolvedValue({ items: [{ id: 1 }], next_cursor: null });
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      await act(async () => {
        await Promise.resolve();
      });

      act(() => result.current.filters.setFilterLength("not-a-number"));
      act(() => vi.advanceTimersByTime(300));

      expect(result.current.filters.filterLengthError).toBe(
        "Length must be a positive whole number.",
      );
      expect(result.current.results.times).toEqual([]);
      expect(result.current.results.loading).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("sets an error message when the request fails", async () => {
    protectedFrontFetch.mockRejectedValue(new ApiError("Server error", 500));
    const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));

    await waitFor(() => expect(result.current.results.error).toBe("Server error"));
  });

  it("does not set an error message when the failure is an auth redirect", async () => {
    protectedFrontFetch.mockRejectedValue(new AuthRedirectError());
    const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.results.error).toBe("");
  });

  describe("handleLoadMore", () => {
    it("does nothing when there is no next cursor", async () => {
      protectedFrontFetch.mockResolvedValue(emptyPage);
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(1));

      await act(async () => result.current.results.handleLoadMore());

      expect(protectedFrontFetch).toHaveBeenCalledTimes(1);
    });

    it("appends the next page and advances the cursor", async () => {
      const first = { id: 1, date: "2026-01-01", stroke: "freestyle" };
      const second = { id: 2, date: "2026-01-01", stroke: "freestyle" };
      protectedFrontFetch.mockResolvedValueOnce({ items: [first], next_cursor: "abc" });
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      await waitFor(() => expect(result.current.results.times).toEqual([first]));

      protectedFrontFetch.mockResolvedValueOnce({ items: [second], next_cursor: null });
      await act(async () => result.current.results.handleLoadMore());

      expect(protectedFrontFetch).toHaveBeenLastCalledWith(
        "/swim-log/api?date_from=2026-01-01&date_to=2026-01-01&cursor=abc",
      );
      expect(result.current.results.times).toEqual([first, second]);
      expect(result.current.results.nextCursor).toBeNull();
    });
  });

  describe("insertIfCurrentView", () => {
    it("prepends a created time that matches the current date and (empty) filters", async () => {
      protectedFrontFetch.mockResolvedValue(emptyPage);
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(1));

      const generation = result.current.getViewGeneration();
      const created = { ...baseSwimTime };
      act(() => result.current.insertIfCurrentView(created, generation));

      expect(result.current.results.times).toEqual([created]);
    });

    it("ignores a created time from a stale (superseded) request generation", async () => {
      protectedFrontFetch.mockResolvedValue(emptyPage);
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(1));

      const staleGeneration = result.current.getViewGeneration();
      act(() => result.current.filters.setFilterStroke("backstroke"));
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(2));

      const created = { ...baseSwimTime };
      act(() => result.current.insertIfCurrentView(created, staleGeneration));

      expect(result.current.results.times).toEqual([]);
    });

    it("ignores a created time that doesn't match the active stroke filter", async () => {
      protectedFrontFetch.mockResolvedValue(emptyPage);
      const { result } = renderHook(() => useSwimTimesQuery("2026-01-01"));
      act(() => result.current.filters.setFilterStroke("backstroke"));
      await waitFor(() => expect(protectedFrontFetch).toHaveBeenCalledTimes(2));

      const generation = result.current.getViewGeneration();
      const created = { ...baseSwimTime };
      act(() => result.current.insertIfCurrentView(created, generation));

      expect(result.current.results.times).toEqual([]);
    });
  });
});
