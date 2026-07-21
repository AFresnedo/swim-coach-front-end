import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "./helpers/fake-jwt";

const { getCookie, setCookie } = vi.hoisted(() => ({ getCookie: vi.fn(), setCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie, set: setCookie }),
}));

const { checkLoggedIn, setAuthCookie } = await import("@/shared/auth");

describe("checkLoggedIn", () => {
  it("returns false when there is no auth cookie", async () => {
    getCookie.mockReturnValue(undefined);
    expect(await checkLoggedIn()).toBe(false);
  });

  it("returns true for a token that hasn't expired", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    expect(await checkLoggedIn()).toBe(true);
  });

  it("returns false for an expired token", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(-3600) });
    expect(await checkLoggedIn()).toBe(false);
  });

  it("returns false for a malformed token", async () => {
    getCookie.mockReturnValue({ value: "not-a-jwt" });
    expect(await checkLoggedIn()).toBe(false);
  });
});

describe("setAuthCookie", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setCookie.mockReset();
  });

  it("hardens the auth cookie against XSS, transport, and CSRF exposure", async () => {
    await setAuthCookie(fakeJwt(3600));

    expect(setCookie).toHaveBeenCalledWith(
      "access_token",
      expect.stringMatching(/^header\./),
      expect.objectContaining({ httpOnly: true, sameSite: "strict", path: "/" }),
    );
  });

  it("sets secure only in production, so http://localhost still receives the cookie in dev", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await setAuthCookie(fakeJwt(3600));
    expect(setCookie).toHaveBeenLastCalledWith(
      "access_token",
      expect.any(String),
      expect.objectContaining({ secure: false }),
    );

    vi.stubEnv("NODE_ENV", "production");
    await setAuthCookie(fakeJwt(3600));
    expect(setCookie).toHaveBeenLastCalledWith(
      "access_token",
      expect.any(String),
      expect.objectContaining({ secure: true }),
    );
  });

  it("expires the cookie with the token instead of outliving it", async () => {
    await setAuthCookie(fakeJwt(3600));

    // cookieStore.set(name, value, options) — maxAge lives on the options arg.
    const options = setCookie.mock.lastCall?.[2];
    // Derived from the JWT's own exp, so allow a second of clock drift between
    // the test minting the token and setAuthCookie reading it back.
    expect(options?.maxAge).toBeGreaterThan(3595);
    expect(options?.maxAge).toBeLessThanOrEqual(3600);
  });
});
