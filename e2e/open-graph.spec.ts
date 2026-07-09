import { expect, test } from "@playwright/test";

test("home page exposes Open Graph meta tags for link previews", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /SwimCoach/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "SwimCoach",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
});

test("generated Open Graph image responds with a PNG", async ({ page, request }) => {
  await page.goto("/");

  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
  if (!imageUrl) throw new Error("og:image meta tag has no content attribute");

  const response = await request.get(imageUrl);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});
