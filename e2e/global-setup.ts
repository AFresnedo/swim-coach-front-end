import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { FullConfig } from "@playwright/test";

const APP_DIR = join(__dirname, "..", "app");

function collectRoutes(dir: string, segments: string[] = []): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      routes.push(...collectRoutes(fullPath, [...segments, entry]));
    } else if (entry === "page.tsx" || entry === "route.ts") {
      // Dynamic segments (e.g. "[id]") have no concrete value to request here;
      // skip them and let the owning spec exercise them directly instead.
      if (segments.some((segment) => segment.startsWith("["))) continue;
      routes.push(`/${segments.join("/")}`);
    }
  }
  return routes;
}

/*
 * Why this file exists
 * --------------------
 * Our e2e suite runs `npm run dev` (webServer in playwright.config.ts), not a
 * production build. Next's dev server compiles each route lazily, the first
 * time it's requested in that server process's lifetime — the module graph
 * for a page or route handler doesn't exist until something asks for it.
 *
 * Playwright runs each spec *file* in its own parallel worker by default. Our
 * four spec files each visit a different set of pages: home, sign-up,
 * sign-in, profile, goals, strokes, etc. The first time this whole suite runs
 * against a freshly started dev server, every worker's first navigation is
 * simultaneously asking the single dev-server process to compile a route it
 * has never seen before. Next can only compile so much at once, so one of
 * those first-time compiles can take several seconds — long enough to blow
 * past Playwright's default 5s assertion timeout.
 *
 * We saw exactly this: `auth-nav.spec.ts` failed a `toHaveURL("/")` check
 * after clicking "Log out" (which hits the trivial `/api/logout` route —
 * nothing about that handler is slow) only when all 4 spec files ran
 * together. Re-running the full suite immediately after — with every route
 * already compiled and cached in the dev server's memory from the first
 * run — passed instantly and repeatably. Isolating the failing spec on its
 * own also passed instantly. That combination (fails only under concurrent
 * first-time navigation, passes reliably once warm or when uncontended)
 * points at dev-server compile contention, not a real bug in the logout flow.
 *
 * The fix: Playwright's `globalSetup` runs once, after the webServer is up,
 * before any worker starts. We use it to walk `app/` for every page and route
 * handler and request each one *sequentially* — one compile at a time, no
 * contention — so that by the time the parallel workers start, every route
 * they'll touch is already compiled and fast. This removes the race
 * condition at its source, rather than just raising timeouts to tolerate it
 * (which would hide real regressions behind a longer wait).
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";

  for (const route of collectRoutes(APP_DIR)) {
    await fetch(`${baseURL}${route}`).catch(() => {});
  }
}
