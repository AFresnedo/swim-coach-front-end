import { describe, expect, it, vi } from "vitest";
import { fakeJwt } from "./helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

const { checkLoggedIn } = await import("@/lib/auth");

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
