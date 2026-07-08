import { expect, test } from "@playwright/test";

for (const path of ["/profile", "/goals", "/swim-log"]) {
  test(`visiting ${path} directly while logged out redirects to sign-in`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL("/sign-in");
  });
}
