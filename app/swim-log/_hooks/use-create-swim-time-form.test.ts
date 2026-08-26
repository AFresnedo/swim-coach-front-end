import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCreateSwimTimeForm } from "@/app/swim-log/_hooks/use-create-swim-time-form";
import { ApiError } from "@/shared/front-api";
import { AuthRedirectError } from "@/shared/protected-fetch";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

function setUp(overrides: Partial<Parameters<typeof useCreateSwimTimeForm>[0]> = {}) {
  const insertIfCurrentView = vi.fn();
  const getViewGeneration = vi.fn().mockReturnValue(1);
  const { result } = renderHook(() =>
    useCreateSwimTimeForm({
      selectedDate: "2026-01-01",
      getViewGeneration,
      insertIfCurrentView,
      ...overrides,
    }),
  );
  return { result, insertIfCurrentView, getViewGeneration };
}

async function submit(result: ReturnType<typeof setUp>["result"]) {
  await act(async () => {
    await result.current.handleCreate({
      preventDefault: () => {},
    } as React.SubmitEvent<HTMLFormElement>);
  });
}

describe("useCreateSwimTimeForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("rejects an invalid time without calling the backend", async () => {
    const { result } = setUp();
    act(() => result.current.setLength("50"));
    act(() => result.current.setTimeText("not-a-time"));

    await submit(result);

    expect(result.current.createError).toBe('Enter a valid time, e.g. "1:02.35" or "32.10".');
    expect(protectedFrontFetch).not.toHaveBeenCalled();
  });

  it("submits the parsed time and defaults, then inserts the created time and resets per-swim fields", async () => {
    const created = { id: 1, stroke: "freestyle" };
    protectedFrontFetch.mockResolvedValue(created);
    const { result, insertIfCurrentView, getViewGeneration } = setUp();

    act(() => result.current.setLength("50"));
    act(() => result.current.setTimeText("1:02.35"));
    act(() => result.current.setNotes("  felt good  "));

    await submit(result);

    expect(protectedFrontFetch).toHaveBeenCalledWith("/swim-log/api", {
      method: "POST",
      body: JSON.stringify({
        date: "2026-01-01",
        stroke: "freestyle",
        course: "scy",
        length: 50,
        attempt_number: 1,
        time_seconds: 62.35,
        is_official: false,
        notes: "felt good",
      }),
    });
    expect(insertIfCurrentView).toHaveBeenCalledWith(created, getViewGeneration());
    // Per-swim fields reset after a successful submit, but stroke/course don't —
    // logging several swims back-to-back usually repeats the same stroke/course.
    expect(result.current.length).toBe("");
    expect(result.current.timeText).toBe("");
    expect(result.current.notes).toBe("");
    expect(result.current.stroke).toBe("freestyle");
  });

  it("sends null notes when notes is blank/whitespace-only", async () => {
    protectedFrontFetch.mockResolvedValue({ id: 1 });
    const { result } = setUp();
    act(() => result.current.setLength("50"));
    act(() => result.current.setTimeText("32.10"));
    act(() => result.current.setNotes("   "));

    await submit(result);

    const body = JSON.parse(protectedFrontFetch.mock.calls[0][1].body);
    expect(body.notes).toBeNull();
  });

  it("sets a general error and field errors when the request fails", async () => {
    protectedFrontFetch.mockRejectedValue(
      new ApiError("Validation failed", 422, { length: "must be positive" }),
    );
    const { result } = setUp();
    act(() => result.current.setLength("50"));
    act(() => result.current.setTimeText("32.10"));

    await submit(result);

    expect(result.current.createError).toBe("Validation failed");
    expect(result.current.createFieldErrors).toEqual({ length: "must be positive" });
  });

  it("swallows an auth-redirect error without setting an error message", async () => {
    protectedFrontFetch.mockRejectedValue(new AuthRedirectError());
    const { result } = setUp();
    act(() => result.current.setLength("50"));
    act(() => result.current.setTimeText("32.10"));

    await submit(result);

    expect(result.current.createError).toBe("");
  });
});
