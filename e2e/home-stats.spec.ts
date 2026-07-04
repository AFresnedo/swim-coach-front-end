import { expect, test } from "@playwright/test";

test("home page streams in a live signed-up user count", async ({ page }) => {
  await page.goto("/");

  const value = page.getByText("Swimmers training").locator("xpath=preceding-sibling::p[1]");

  // toHaveText auto-retries, so this also covers the brief "Fetching..." Suspense
  // fallback resolving into the real streamed-in count.
  await expect(value).toHaveText(/^[\d,]+$/);
});
