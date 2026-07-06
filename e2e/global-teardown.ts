import { execFile } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { CREATED_USERS_FILE } from "./fixtures";

const execFileAsync = promisify(execFile);

// swim-coach and back-end are sibling checkouts on this machine (see back-end/AGENTS.md).
const BACKEND_DIR = join(__dirname, "..", "..", "back-end");

export default async function globalTeardown(): Promise<void> {
  if (!existsSync(CREATED_USERS_FILE)) return;

  const emails = [...new Set(readFileSync(CREATED_USERS_FILE, "utf-8").split("\n").filter(Boolean))];
  rmSync(CREATED_USERS_FILE);

  if (emails.length === 0) return;

  try {
    const { stdout } = await execFileAsync("uv", ["run", "python", "-m", "scripts.cleanup_e2e_users", ...emails], {
      cwd: BACKEND_DIR,
    });
    process.stdout.write(stdout);
  } catch (error) {
    console.warn("e2e cleanup failed (leftover test users may remain in the local DB):", error);
  }
}
