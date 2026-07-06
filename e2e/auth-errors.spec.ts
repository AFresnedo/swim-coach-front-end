import { expect, test } from "./fixtures";

test("sign-in with wrong password shows an error and does not log in", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: /account/i }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("WrongPassword1!");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByText("Incorrect email or password")).toBeVisible();
  await expect(page).toHaveURL("/sign-in");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("sign-up with an already-registered email shows an error and does not log in", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("button", { name: /account/i }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User Again");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("AnotherPassword1!");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText("Email already registered")).toBeVisible();
  await expect(page).toHaveURL("/sign-up");
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
});
