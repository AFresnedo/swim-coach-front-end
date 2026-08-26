import { expect, test } from "./fixtures";

test("401 from a protected API call redirects to sign-in with a session-expired message", async ({
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

  await page.route("**/goals/api*", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Could not validate credentials" }),
    }),
  );

  await page.goto("/goals");

  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByText("Your session expired — please sign in again.")).toBeVisible();

  // The redirect replaces the /goals history entry rather than pushing a new
  // one, so back should return to the page visited before /goals (here, "/")
  // instead of re-entering /goals and immediately bouncing back to /sign-in
  // again.
  await page.goBack();
  await expect(page).toHaveURL("/");
});

// e2e/auth-errors.spec.ts already covers that a 401 from /sign-in/api
// shows an inline error and stays on /sign-in without redirecting.
