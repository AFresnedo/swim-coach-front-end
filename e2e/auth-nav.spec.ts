import { expect, test } from "./fixtures";

test("auth nav flow: sign-up → profile → logout → sign-in", async ({ page, testUser }) => {
  const { email, password } = testUser;

  // 1. Home page while logged out
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profile" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).not.toBeVisible();

  // 2. Sign up
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  // 3. After sign-up: logged-in nav
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).not.toBeVisible();

  // 4. Navigate to profile
  await page.getByRole("link", { name: "Profile" }).click();
  await expect(page).toHaveURL("/profile");

  // 5. Log out
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profile" })).not.toBeVisible();

  // 6. Sign in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // 7. After sign-in: logged-in nav again
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
});
