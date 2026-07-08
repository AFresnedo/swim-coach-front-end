import { expect, test } from "./fixtures";

test("swim log flow: log entry → view for date → date-scoped fetch", async ({ page, testUser }) => {
  const { email, password } = testUser;

  // Sign up to get an authenticated session
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("textbox", { name: "Confirm password" }).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/swim-log");
  await expect(page.getByText(/no times logged for this date yet/i)).toBeVisible();

  const todayValue = await page.getByLabel("Date").inputValue();

  // Create — assert on the actual POST response, not just the resulting DOM,
  // so this fails loudly if the backend ever stops persisting/echoing a field.
  const [createResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/api/swim-times") && res.request().method() === "POST",
    ),
    (async () => {
      await page.getByRole("spinbutton", { name: "Length", exact: true }).fill("50");
      await page.getByRole("textbox", { name: "Time", exact: true }).fill("0:32.10");
      await page.getByRole("button", { name: "Log time" }).click();
    })(),
  ]);
  const created = await createResponse.json();
  expect(created).toMatchObject({
    date: todayValue,
    stroke: "freestyle",
    course: "scy",
    length: 50,
    attempt_number: 1,
    time_seconds: 32.1,
    is_official: false,
  });
  await expect(page.getByText("0:32.10")).toBeVisible();

  // Switch to a different date — the day-scoped fetch should show it empty
  const otherDate = "2020-01-01";
  const [otherDayResponse] = await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes(`/api/swim-times?date_from=${otherDate}&date_to=${otherDate}`),
    ),
    page.getByLabel("Date").fill(otherDate),
  ]);
  expect(otherDayResponse.ok()).toBeTruthy();
  await expect(page.getByText(/no times logged for this date yet/i)).toBeVisible();
  await expect(page.getByText("0:32.10")).not.toBeVisible();

  // Switch back to today — the entry reappears
  const [todayResponse] = await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes(`/api/swim-times?date_from=${todayValue}&date_to=${todayValue}`),
    ),
    page.getByLabel("Date").fill(todayValue),
  ]);
  expect(todayResponse.ok()).toBeTruthy();
  await expect(page.getByText("0:32.10")).toBeVisible();

  // Filtering by a non-matching stroke hides the entry
  const [mismatchResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("stroke=backstroke")),
    page.getByLabel("Filter by stroke").selectOption("backstroke"),
  ]);
  expect(mismatchResponse.ok()).toBeTruthy();
  await expect(page.getByText(/no times match these filters/i)).toBeVisible();
  await expect(page.getByText("0:32.10")).not.toBeVisible();

  // Clearing filters brings it back
  const [clearedResponse] = await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes(`/api/swim-times?date_from=${todayValue}&date_to=${todayValue}`),
    ),
    page.getByRole("button", { name: "Clear filters" }).click(),
  ]);
  expect(clearedResponse.ok()).toBeTruthy();
  await expect(page.getByText("0:32.10")).toBeVisible();
});
