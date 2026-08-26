import { afterEach, describe, expect, it, vi } from "vitest";

describe("TURNSTILE_TEST_MODE", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("is false when the flag is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NODE_ENV", "development");
    const { TURNSTILE_TEST_MODE } = await import("@/app/(auth)/sign-up/_data/turnstile-test-mode");
    expect(TURNSTILE_TEST_MODE).toBe(false);
  });

  it("is true when the flag is set outside production", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.stubEnv("NODE_ENV", "development");
    const { TURNSTILE_TEST_MODE } = await import("@/app/(auth)/sign-up/_data/turnstile-test-mode");
    expect(TURNSTILE_TEST_MODE).toBe(true);
  });

  it("is false in production even when the flag is set, as defense in depth against a prod CAPTCHA bypass", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.stubEnv("NODE_ENV", "production");
    const { TURNSTILE_TEST_MODE } = await import("@/app/(auth)/sign-up/_data/turnstile-test-mode");
    expect(TURNSTILE_TEST_MODE).toBe(false);
  });
});
