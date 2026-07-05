import { expect, test } from "@playwright/test";

test("goals flow: create → edit → filter → deactivate", async ({ page }) => {
  // Random suffix avoids colliding with other specs' Date.now()-based emails when run in parallel workers.
  const email = `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
  const password = "TestPassword1!";

  // Sign up to get an authenticated session
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/goals");
  await expect(page.getByText(/no active goals yet/i)).toBeVisible();

  // Create
  await page.getByLabel("New goal").fill("Swim a sub-1:00 100m free");
  await page.getByRole("button", { name: "Add goal" }).click();
  await expect(page.getByText("Swim a sub-1:00 100m free")).toBeVisible();

  // Edit
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Edit goal").fill("Swim a sub-58 100m free");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Swim a sub-58 100m free")).toBeVisible();

  // Deactivate — confirm stays disabled until a reason is picked
  await page.getByRole("button", { name: "Deactivate" }).click();
  const confirmButton = page.getByRole("button", { name: "Confirm" });
  await expect(confirmButton).toBeDisabled();
  await page.getByLabel("Reason").selectOption("reached");
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  // Active filter hides it; All filter shows it read-only with reason
  await expect(page.getByText("Swim a sub-58 100m free")).not.toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText("Swim a sub-58 100m free")).toBeVisible();
  await expect(page.getByText(/deactivated.*reached/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" })).not.toBeVisible();
});
