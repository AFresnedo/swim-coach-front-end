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
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  // 3. After sign-up: logged-in nav, Profile/Log out live behind the Account menu
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).not.toBeVisible();
  await page.getByRole("button", { name: /account/i }).click();
  await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();

  // 4. Navigate to profile
  await page.getByRole("menuitem", { name: "Profile" }).click();
  await expect(page).toHaveURL("/profile");

  // 5. Log out
  await page.getByRole("button", { name: /account/i }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  await expect(page.getByRole("button", { name: /account/i })).not.toBeVisible();

  // 6. Sign in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // 7. After sign-in: logged-in nav again
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: /account/i }).click();
  await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();
});
