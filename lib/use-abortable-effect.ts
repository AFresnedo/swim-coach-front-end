"use client";

import { type DependencyList, useEffect } from "react";

// Runs `effect` like a normal useEffect, but hands it an AbortSignal tied to
// that specific run — abort() fires automatically on cleanup, whether that's
// because deps changed or the component unmounted, so callers can't forget
// to cancel a stale request the way a hand-rolled `cancelled` flag requires.
export function useAbortableEffect(effect: (signal: AbortSignal) => void, deps: DependencyList) {
  useEffect(() => {
    const controller = new AbortController();
    effect(controller.signal);
    return () => controller.abort();
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is a forwarded parameter, not a literal array — inherently unverifiable here. Callers of useAbortableEffect ARE checked, via the "hooks" entry for useAbortableEffect in biome.json.
  }, deps);
}
