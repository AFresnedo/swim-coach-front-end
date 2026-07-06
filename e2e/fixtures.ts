import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { test as base } from "@playwright/test";

// Read by global-teardown.ts after the run to know exactly which users to delete.
export const CREATED_USERS_FILE = join(__dirname, ".e2e-users.jsonl");

export const test = base.extend<{ testUser: { email: string; password: string } }>({
  // Centralizes e2e user creation so cleanup can track exactly what was made,
  // instead of guessing from a naming convention specs might drift away from.
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture signature requires this first param.
  testUser: async ({}, use, testInfo) => {
    const email = `test_${Date.now()}_${testInfo.workerIndex}_${Math.random().toString(36).slice(2)}@example.com`;
    const password = "TestPassword1!";

    await use({ email, password });

    // Runs after the test regardless of pass/fail, so the email is recorded
    // even if the spec fails partway through sign-up.
    appendFileSync(CREATED_USERS_FILE, `${email}\n`);
  },
});

export { expect } from "@playwright/test";
