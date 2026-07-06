import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { test as base } from "@playwright/test";

// Read by global-teardown.ts after the run to know exactly which users to delete.
export const CREATED_USERS_FILE = join(__dirname, ".e2e-users.jsonl");

type TestUser = { email: string; password: string };

function makeUserFixture(tag: string) {
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires this first param.
  return async ({}, use: (user: TestUser) => Promise<void>, testInfo: { workerIndex: number }) => {
    const email = `test_${tag}_${Date.now()}_${testInfo.workerIndex}_${Math.random().toString(36).slice(2)}@example.com`;
    const password = "TestPassword1!";

    await use({ email, password });

    // Runs after the test regardless of pass/fail, so the email is recorded
    // even if the spec fails partway through sign-up.
    appendFileSync(CREATED_USERS_FILE, `${email}\n`);
  };
}

export const test = base.extend<{ testUser: TestUser; otherUser: TestUser }>({
  // Centralizes e2e user creation so cleanup can track exactly what was made,
  // instead of guessing from a naming convention specs might drift away from.
  testUser: makeUserFixture("a"),
  // A second, independent account — for specs that need to prove one user
  // can't act on another user's data (e.g. cross-account authorization checks).
  otherUser: makeUserFixture("b"),
});

export { expect } from "@playwright/test";
