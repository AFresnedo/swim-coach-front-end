import { expect, test } from "./fixtures";

test("password field visibility can be toggled", async ({ page, testUser }) => {
  const { password } = testUser;

  await page.goto("/sign-in");
  const passwordInput = page.getByRole("textbox", { name: "Password", exact: true });
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: /show password/i }).click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await expect(passwordInput).toHaveValue(password);

  await page.getByRole("button", { name: /hide password/i }).click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});

test("sign-up shows an error when password and confirm password don't match", async ({
  page,
  testUser,
}) => {
  const { email, password } = testUser;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(`${password}x`);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await expect(page).toHaveURL("/sign-up");
});

test("confirm password field does not block paste, unlike a manual-retype-only field", async ({
  page,
  testUser,
}) => {
  const { password } = testUser;

  await page.goto("/sign-up");
  const confirmInput = page.getByRole("textbox", { name: "Confirm password" });

  // Simulates a password manager pasting into the field: dispatch a real paste
  // event (not just .fill(), which bypasses paste handling entirely) and
  // confirm the app never calls preventDefault() on it.
  const defaultPrevented = await confirmInput.evaluate((el: HTMLInputElement, text: string) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text);
    const event = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }, password);

  expect(defaultPrevented).toBe(false);
});
