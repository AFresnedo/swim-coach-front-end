import { expect, test } from "./fixtures";

test("logout invalidates the token everywhere, not just the local cookie", async ({
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

  const token = (await page.context().cookies()).find((c) => c.name === "access_token")?.value;
  if (!token) throw new Error("access_token cookie missing after sign-up");

  // Sanity check: the token is live before logout.
  const beforeRes = await page.request.get("/api/profile");
  expect(beforeRes.ok()).toBe(true);

  await page.getByRole("button", { name: /account/i }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");

  // The pre-logout token must be rejected everywhere now, not just cleared
  // from this browser's cookie jar - that's what distinguishes a real
  // server-side logout (invalidates all devices) from merely deleting the
  // local cookie.
  const afterRes = await page.request.get("/api/profile", {
    headers: { Cookie: `access_token=${token}` },
  });
  expect(afterRes.status()).toBe(401);
});
