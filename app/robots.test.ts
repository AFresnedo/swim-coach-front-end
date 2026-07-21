import { afterEach, describe, expect, it, vi } from "vitest";

describe("robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("disallows all crawlers when SITE_INDEXABLE is unset", async () => {
    vi.stubEnv("SITE_INDEXABLE", "");
    vi.resetModules();
    const { default: robots } = await import("@/app/robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows all crawlers when SITE_INDEXABLE is 'true'", async () => {
    vi.stubEnv("SITE_INDEXABLE", "true");
    vi.resetModules();
    const { default: robots } = await import("@/app/robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
    });
  });
});
