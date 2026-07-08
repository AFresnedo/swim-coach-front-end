import { expect, test } from "./fixtures";

test("disclaimer banner is visible for logged-out and logged-in users", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/");
  await expect(page.getByText(/has not been reviewed by a/i)).toBeVisible();

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await page.getByRole("checkbox", { name: /wipe/i }).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await expect(page.getByText(/has not been reviewed by a/i)).toBeVisible();
});

test("dismissing the disclaimer banner hides it for the rest of the session", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByText(/has not been reviewed by a/i);
  await expect(banner).toBeVisible();

  await page.getByRole("button", { name: "Dismiss disclaimer" }).click();
  await expect(banner).not.toBeVisible();

  await page.goto("/strokes");
  await expect(banner).not.toBeVisible();
});

test("disclaimer page is reachable from the banner and the sign-up checkbox", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Learn more" }).click();
  await expect(page).toHaveURL("/disclaimer");
  await expect(page.getByRole("heading", { name: "Disclaimer" })).toBeVisible();

  await page.goto("/sign-up");
  const [disclaimerPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: "disclaimer" }).click(),
  ]);
  await expect(disclaimerPage).toHaveURL("/disclaimer");
});

test("sign-up submit is blocked until both acknowledgments are checked", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);

  const submit = page.getByRole("button", { name: /create account/i });
  await expect(submit).toBeDisabled();

  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await expect(submit).toBeDisabled();

  await page.getByRole("checkbox", { name: /wipe/i }).check();
  await expect(submit).toBeEnabled();
});

test("sign-up submit is blocked until the data-wipe acknowledgment is checked", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);

  const submit = page.getByRole("button", { name: /create account/i });
  await page.getByRole("checkbox", { name: /wipe/i }).check();
  await expect(submit).toBeDisabled();

  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await expect(submit).toBeEnabled();
});
