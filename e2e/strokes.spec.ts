import { expect, test } from "./fixtures";

test("strokes hub and stroke pages are public, drills require sign-in", async ({
  page,
  testUser,
}) => {
  // Nav link is reachable from the home page while logged out
  await page.goto("/");
  await page.getByRole("link", { name: "Strokes" }).click();
  await expect(page).toHaveURL("/strokes");
  await expect(page.getByRole("heading", { name: "Strokes" })).toBeVisible();

  for (const stroke of ["Freestyle", "Backstroke", "Breaststroke", "Butterfly"]) {
    await expect(page.getByRole("heading", { name: stroke })).toBeVisible();
  }

  // Stroke detail page is public: description renders, but drills are gated
  await page.getByRole("link", { name: "View drills" }).first().click();
  await expect(page).toHaveURL("/strokes/freestyle");
  await expect(page.getByRole("heading", { name: /freestyle/i })).toBeVisible();
  await expect(page.getByText(/fastest and most versatile stroke/i)).toBeVisible();
  const gate = page.locator("div", { hasText: /sign in to see the full drill breakdown/i }).last();
  await expect(gate).toBeVisible();
  await expect(page.getByText("Catch-Up Drill")).not.toBeVisible();

  // Signing in reveals the drills on the same page
  await gate.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/sign-in");

  const { email, password } = testUser;
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/strokes/freestyle");
  await expect(page.getByText("Catch-Up Drill")).toBeVisible();
  await expect(page.getByText(/sign in to see the full drill breakdown/i)).not.toBeVisible();
});

const otherStrokes = [
  { slug: "backstroke", heading: /backstroke/i, firstDrill: "Single-Arm Backstroke" },
  { slug: "breaststroke", heading: /breaststroke/i, firstDrill: "Pull Buoy Pull" },
  { slug: "butterfly", heading: /butterfly/i, firstDrill: "Single-Arm Butterfly" },
];

for (const { slug, heading, firstDrill } of otherStrokes) {
  test(`${slug} page is public and gates its drills`, async ({ page, testUser }) => {
    // Logged out: description renders, drills are gated
    await page.goto(`/strokes/${slug}`);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText(/sign in to see the full drill breakdown/i)).toBeVisible();
    await expect(page.getByText(firstDrill)).not.toBeVisible();

    // Logged in: same page now shows its own drills
    const { email, password } = testUser;
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
    await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
    await page.getByRole("checkbox", { name: /disclaimer/i }).check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL("/");

    await page.goto(`/strokes/${slug}`);
    await expect(page.getByText(firstDrill)).toBeVisible();
    await expect(page.getByText(/sign in to see the full drill breakdown/i)).not.toBeVisible();
  });
}
