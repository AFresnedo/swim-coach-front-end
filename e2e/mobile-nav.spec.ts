import { expect, test } from "./fixtures";

test.describe("mobile nav", () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test("collapses into a toggleable menu on small screens", async ({ page }) => {
    await page.goto("/");

    // Nav links are tucked behind the toggle, not shown inline.
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Strokes" })).not.toBeVisible();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Strokes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

    await page.getByRole("link", { name: "Strokes" }).click();
    await expect(page).toHaveURL("/strokes");
  });
});

test("nav links show inline instead of behind a toggle on wide screens", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Open menu" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Strokes" })).toBeVisible();
});
