import { expect, test } from "./fixtures";

test("goals flow: create → edit → filter → deactivate", async ({ page, testUser }) => {
  const { email, password } = testUser;

  // Sign up to get an authenticated session
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await page.getByRole("checkbox", { name: /wipe/i }).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/goals");
  await expect(page.getByText(/no active goals yet/i)).toBeVisible();

  // Create — assert on the actual POST response, not just the resulting DOM,
  // so this fails loudly if the backend ever stops persisting/echoing a field.
  const [createResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/goals/api") && res.request().method() === "POST",
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
      (res) => res.url().includes(`/goals/api/${created.id}`) && res.request().method() === "PATCH",
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

  // Deactivate — submitting without picking a reason is blocked by native required validation
  await page.getByRole("button", { name: "Deactivate" }).click();
  const confirmButton = page.getByRole("button", { name: "Confirm" });
  await confirmButton.click();
  const validationMessage = await page
    .getByLabel("Reason")
    .evaluate((el: HTMLSelectElement) => el.validationMessage);
  expect(validationMessage).not.toBe("");
  await expect(page.getByText("Swim a sub-58 100m free")).toBeVisible();
  await page.getByLabel("Reason").selectOption("reached");

  const [deactivateResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes(`/goals/api/${created.id}/deactivate`) &&
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

test("editing two goals at once keeps their edit sessions independent", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("checkbox", { name: /disclaimer/i }).check();
  await page.getByRole("checkbox", { name: /wipe/i }).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/goals");

  async function createGoal(text: string): Promise<number> {
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/goals/api") && res.request().method() === "POST",
      ),
      (async () => {
        await page.getByLabel("New goal").fill(text);
        await page.getByRole("button", { name: "Add goal" }).click();
      })(),
    ]);
    return (await response.json()).id;
  }

  const idA = await createGoal("Goal A");
  const idB = await createGoal("Goal B");

  const cardA = page.getByTestId(`goal-card-${idA}`);
  const cardB = page.getByTestId(`goal-card-${idB}`);

  await cardA.getByRole("button", { name: "Edit" }).click();
  await cardB.getByRole("button", { name: "Edit" }).click();

  // Both cards are independently in edit mode, each showing its own text.
  await expect(cardA.getByLabel("Edit goal")).toHaveValue("Goal A");
  await expect(cardB.getByLabel("Edit goal")).toHaveValue("Goal B");

  await cardA.getByLabel("Edit goal").fill("Goal A updated");
  const [editResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes(`/goals/api/${idA}`) && res.request().method() === "PATCH",
    ),
    cardA.getByRole("button", { name: "Save" }).click(),
  ]);
  expect(await editResponse.json()).toMatchObject({ id: idA, text: "Goal A updated" });

  // Card A saved and returned to view mode; card B's edit session was untouched.
  await expect(cardA.getByText("Goal A updated")).toBeVisible();
  await expect(cardB.getByLabel("Edit goal")).toHaveValue("Goal B");
});
