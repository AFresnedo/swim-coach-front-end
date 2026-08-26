import { afterEach, describe, expect, it, vi } from "vitest";

describe("SITE_INDEXABLE", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("fails closed (not indexable) when the env var is unset", async () => {
    vi.stubEnv("SITE_INDEXABLE", "");
    const { SITE_INDEXABLE } = await import("@/shared/site-config");
    expect(SITE_INDEXABLE).toBe(false);
  });

  it("is only true when the env var is exactly the string 'true'", async () => {
    vi.stubEnv("SITE_INDEXABLE", "1");
    const { SITE_INDEXABLE: notTrue } = await import("@/shared/site-config");
    expect(notTrue).toBe(false);

    vi.resetModules();
    vi.stubEnv("SITE_INDEXABLE", "true");
    const { SITE_INDEXABLE: isTrue } = await import("@/shared/site-config");
    expect(isTrue).toBe(true);
  });
});
