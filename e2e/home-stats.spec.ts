import { expect, test } from "@playwright/test";

test("home page streams in a live signed-up user count", async ({ page }) => {
  await page.goto("/");

  const value = page.getByTestId("stat-value-Swimmers training");

  // toHaveText auto-retries, so this also covers the brief "Fetching..." Suspense
  // fallback resolving into the real streamed-in count.
  await expect(value).toHaveText(/^[\d,]+$/);
});

test("home page streams in a live swims logged count", async ({ page }) => {
  await page.goto("/");

  const value = page.getByTestId("stat-value-Swims logged");

  // toHaveText auto-retries, so this also covers the brief "Fetching..." Suspense
  // fallback resolving into the real streamed-in count.
  await expect(value).toHaveText(/^[\d,]+$/);
});
