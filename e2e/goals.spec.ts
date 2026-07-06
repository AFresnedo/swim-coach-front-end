import { expect, test } from "./fixtures";

test("goals flow: create → edit → filter → deactivate", async ({ page, testUser }) => {
  const { email, password } = testUser;

  // Sign up to get an authenticated session
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/goals");
  await expect(page.getByText(/no active goals yet/i)).toBeVisible();

  // Create — assert on the actual POST response, not just the resulting DOM,
  // so this fails loudly if the backend ever stops persisting/echoing a field.
  const [createResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/api/goals") && res.request().method() === "POST",
    ),
    (async () => {
      await page.getByLabel("New goal").fill("Swim a sub-1:00 100m free");
      await page.getByRole("button", { name: "Add goal" }).click();
    })(),
  ]);
  const created = await createResponse.json();
  expect(created).toMatchObject({ text: "Swim a sub-1:00 100m free", is_active: true });
  await expect(page.getByText("Swim a sub-1:00 100m free")).toBeVisible();

  // Edit
  const [editResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes(`/api/goals/${created.id}`) && res.request().method() === "PATCH",
    ),
    (async () => {
      await page.getByRole("button", { name: "Edit" }).click();
      await page.getByLabel("Edit goal").fill("Swim a sub-58 100m free");
      await page.getByRole("button", { name: "Save" }).click();
    })(),
  ]);
  expect(await editResponse.json()).toMatchObject({
    id: created.id,
    text: "Swim a sub-58 100m free",
  });
  await expect(page.getByText("Swim a sub-58 100m free")).toBeVisible();

  // Deactivate — confirm stays disabled until a reason is picked
  await page.getByRole("button", { name: "Deactivate" }).click();
  const confirmButton = page.getByRole("button", { name: "Confirm" });
  await expect(confirmButton).toBeDisabled();
  await page.getByLabel("Reason").selectOption("reached");
  await expect(confirmButton).toBeEnabled();

  const [deactivateResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes(`/api/goals/${created.id}/deactivate`) &&
        res.request().method() === "PATCH",
    ),
    confirmButton.click(),
  ]);
  expect(await deactivateResponse.json()).toMatchObject({
    id: created.id,
    is_active: false,
    deactivation_reason: "reached",
  });

  // Active filter hides it; All filter shows it read-only with reason
  await expect(page.getByText("Swim a sub-58 100m free")).not.toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText("Swim a sub-58 100m free")).toBeVisible();
  await expect(page.getByText(/deactivated.*reached/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" })).not.toBeVisible();
});
