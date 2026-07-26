import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCreateGoalForm } from "@/app/goals/_hooks/use-create-goal-form";
import { ApiError } from "@/shared/front-api";

const { protectedFrontFetch } = vi.hoisted(() => ({ protectedFrontFetch: vi.fn() }));

vi.mock("@/shared/protected-fetch", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/protected-fetch")>();
  return { ...actual, useProtectedFrontFetch: () => protectedFrontFetch };
});

function setUp() {
  const onCreated = vi.fn();
  const { result } = renderHook(() => useCreateGoalForm(onCreated));
  return { result, onCreated };
}

async function submit(result: ReturnType<typeof setUp>["result"]) {
  await act(async () => {
    await result.current.handleCreate({
      preventDefault: () => {},
    } as React.SubmitEvent<HTMLFormElement>);
  });
}

describe("useCreateGoalForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("submits the entered text, calls onCreated, and clears the input", async () => {
    const created = { id: 1, text: "Swim 200 IM under 3 minutes" };
    protectedFrontFetch.mockResolvedValue(created);
    const { result, onCreated } = setUp();

    act(() => result.current.setNewText("Swim 200 IM under 3 minutes"));
    await submit(result);

    expect(protectedFrontFetch).toHaveBeenCalledWith("/goals/api", {
      method: "POST",
      body: JSON.stringify({ text: "Swim 200 IM under 3 minutes" }),
    });
    expect(onCreated).toHaveBeenCalledWith(created);
    expect(result.current.newText).toBe("");
  });

  it("sets a create error and does not call onCreated when the request fails", async () => {
    protectedFrontFetch.mockRejectedValue(new ApiError("Server error", 500));
    const { result, onCreated } = setUp();
    act(() => result.current.setNewText("New goal text"));

    await submit(result);

    expect(result.current.createError).toBe("Server error");
    expect(onCreated).not.toHaveBeenCalled();
  });
});
