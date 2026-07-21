import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAbortableEffect } from "@/shared/use-abortable-effect";

describe("useAbortableEffect", () => {
  it("runs the effect with a fresh, non-aborted signal", () => {
    const effect = vi.fn();
    renderHook(() => useAbortableEffect(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);
    const signal = effect.mock.calls[0][0] as AbortSignal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("aborts the previous run's signal when a dependency changes", () => {
    const effect = vi.fn();
    // biome-ignore lint/correctness/useExhaustiveDependencies: dep intentionally isn't read by this mock effect — the test only cares that changing it re-triggers useAbortableEffect.
    const { rerender } = renderHook(({ dep }) => useAbortableEffect(effect, [dep]), {
      initialProps: { dep: 1 },
    });
    const firstSignal = effect.mock.calls[0][0] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    rerender({ dep: 2 });

    expect(firstSignal.aborted).toBe(true);
    expect(effect).toHaveBeenCalledTimes(2);
    const secondSignal = effect.mock.calls[1][0] as AbortSignal;
    expect(secondSignal.aborted).toBe(false);
  });

  it("does not rerun the effect when dependencies are unchanged", () => {
    const effect = vi.fn();
    // biome-ignore lint/correctness/useExhaustiveDependencies: dep intentionally isn't read by this mock effect — the test only cares that changing it re-triggers useAbortableEffect.
    const { rerender } = renderHook(({ dep }) => useAbortableEffect(effect, [dep]), {
      initialProps: { dep: 1 },
    });

    rerender({ dep: 1 });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("aborts the signal on unmount", () => {
    const effect = vi.fn();
    const { unmount } = renderHook(() => useAbortableEffect(effect, []));
    const signal = effect.mock.calls[0][0] as AbortSignal;

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
