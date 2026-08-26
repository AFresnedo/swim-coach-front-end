import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// cacheLife() checks at runtime whether cacheComponents is active, which is
// only true inside Next's own server bootstrap (reading next.config.ts) —
// vitest never goes through that, so any "use cache" function calling it
// throws here otherwise. A no-op mock lets the surrounding function body run
// normally; cache timing itself isn't something a unit test can observe.
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
}));
