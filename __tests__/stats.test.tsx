import { afterEach, describe, expect, it, vi } from "vitest";
import { getSwimCount, getUserCount } from "@/app/_lib/stats";

vi.mock("@/shared/back-api", async (importActual) => {
  const actual = await importActual<typeof import("@/shared/back-api")>();
  return { ...actual, safeFetch: vi.fn() };
});

import { safeFetch } from "@/shared/back-api";

const mockFetch = vi.mocked(safeFetch);

describe("getUserCount", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user count on a successful response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user_count: 42 }),
    } as Response);

    expect(await getUserCount()).toBe(42);
  });

  it("returns null when the response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false } as Response);

    expect(await getUserCount()).toBeNull();
  });

  it("returns null when the fetch throws (network error or timeout)", async () => {
    mockFetch.mockRejectedValue(new Error("Server unavailable"));

    expect(await getUserCount()).toBeNull();
  });
});

describe("getSwimCount", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the swim count on a successful response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ swim_count: 17 }),
    } as Response);

    expect(await getSwimCount()).toBe(17);
  });

  it("returns null when the response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false } as Response);

    expect(await getSwimCount()).toBeNull();
  });

  it("returns null when the fetch throws (network error or timeout)", async () => {
    mockFetch.mockRejectedValue(new Error("Server unavailable"));

    expect(await getSwimCount()).toBeNull();
  });
});
