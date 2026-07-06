import { expect, test } from "./fixtures";

test("profile flow: save → reload → prefilled from a fresh load", async ({ page, testUser }) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/profile");
  await expect(page.getByLabel("Age")).toHaveValue("");

  await page.getByLabel("Age").fill("28");
  await page.getByPlaceholder("cm").fill("177.8");
  await page.getByPlaceholder("kg").fill("69.9");
  await page.getByLabel("Sex").selectOption("female");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  // Fresh mount — this is the actual load-on-navigation path, not the just-saved state.
  await page.reload();
  await expect(page.getByLabel("Age")).toHaveValue("28");
  await expect(page.getByPlaceholder("cm")).toHaveValue("177.8");
  await expect(page.getByPlaceholder("kg")).toHaveValue("69.9");
  await expect(page.getByLabel("Sex")).toHaveValue("female");

  // Same loaded profile, converted for the imperial view.
  await page.getByRole("button", { name: "imperial" }).click();
  await expect(page.getByPlaceholder("ft")).toHaveValue("5");
  await expect(page.getByPlaceholder("in")).toHaveValue("10");
  await expect(page.getByPlaceholder("lbs")).toHaveValue("154");
});

test("profile flow: saving while imperial is selected reloads with imperial pre-selected", async ({
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

  await page.goto("/profile");
  await expect(page.getByPlaceholder("cm")).toBeVisible();
  await expect(page.getByPlaceholder("kg")).toBeVisible();

  await page.getByRole("button", { name: "imperial" }).click();
  await page.getByLabel("Age").fill("30");
  await page.getByPlaceholder("ft").fill("5");
  await page.getByPlaceholder("in").fill("10");
  await page.getByPlaceholder("lbs").fill("154");
  await page.getByLabel("Sex").selectOption("male");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  // Fresh mount — the saved unit_preference, not just the default, should drive
  // which toggle is pre-selected on load.
  await page.reload();
  await expect(page.getByPlaceholder("ft")).toHaveValue("5");
  await expect(page.getByPlaceholder("in")).toHaveValue("10");
  await expect(page.getByPlaceholder("lbs")).toHaveValue("154");
  await expect(page.getByPlaceholder("cm")).toHaveCount(0);
});
