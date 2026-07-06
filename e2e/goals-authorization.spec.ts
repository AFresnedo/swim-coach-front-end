import { expect, test } from "./fixtures";

const BASE_URL = "http://localhost:3000";

async function signUp(
  page: import("@playwright/test").Page,
  user: { email: string; password: string },
) {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");
}

test("a user cannot edit or deactivate another user's goal by ID", async ({
  browser,
  testUser,
  otherUser,
}) => {
  const contextA = await browser.newContext({ baseURL: BASE_URL });
  const pageA = await contextA.newPage();
  await signUp(pageA, testUser);

  await pageA.goto("/goals");
  const [createResponse] = await Promise.all([
    pageA.waitForResponse(
      (res) => res.url().includes("/api/goals") && res.request().method() === "POST",
    ),
    (async () => {
      await pageA.getByLabel("New goal").fill("User A's private goal");
      await pageA.getByRole("button", { name: "Add goal" }).click();
    })(),
  ]);
  const goal = await createResponse.json();

  const contextB = await browser.newContext({ baseURL: BASE_URL });
  const pageB = await contextB.newPage();
  await signUp(pageB, otherUser);

  const editAttempt = await contextB.request.patch(`/api/goals/${goal.id}`, {
    data: { text: "hijacked by user B" },
  });
  expect(editAttempt.status()).toBe(404);

  const deactivateAttempt = await contextB.request.patch(`/api/goals/${goal.id}/deactivate`, {
    data: { reason: "reached" },
  });
  expect(deactivateAttempt.status()).toBe(404);

  // User A's goal is untouched by either attempt.
  await pageA.goto("/goals");
  await expect(pageA.getByText("User A's private goal")).toBeVisible();

  await contextA.close();
  await contextB.close();
});
