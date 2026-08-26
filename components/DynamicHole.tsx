import { type ReactNode, Suspense } from "react";

// Marks a Suspense boundary that exists specifically because cacheComponents
// requires it — a per-request read (cookies(), headers()) that can't be part
// of a page's static shell, and would otherwise fail the build with a
// blocking-route error. Distinguishes this from any other reason to reach
// for Suspense (lazy-loaded chunks, a plain client-side loading state) by
// name alone, so a reader doesn't have to infer which one they're looking at.
export function DynamicHole({ fallback, children }: { fallback?: ReactNode; children: ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
