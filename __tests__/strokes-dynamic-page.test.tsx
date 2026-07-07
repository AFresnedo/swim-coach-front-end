import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { hasCookie } = vi.hoisted(() => ({ hasCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ has: hasCookie }),
}));

import StrokePage from "@/app/strokes/[stroke]/page";

describe("StrokePage", () => {
  afterEach(cleanup);

  it("shows drills when the user is logged in", async () => {
    hasCookie.mockReturnValue(true);
    render(
      await StrokePage({
        params: Promise.resolve({ stroke: "freestyle" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByText("Catch-Up Drill")).toBeDefined();
  });

  it("hides drills behind a sign-in prompt when logged out", async () => {
    hasCookie.mockReturnValue(false);
    render(
      await StrokePage({
        params: Promise.resolve({ stroke: "freestyle" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.queryByText("Catch-Up Drill")).toBeNull();
    expect(screen.getByText(/sign in to see/i)).toBeDefined();
  });

  it("renders notFound for an unknown stroke slug", async () => {
    hasCookie.mockReturnValue(true);
    await expect(
      StrokePage({
        params: Promise.resolve({ stroke: "sidestroke" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });
});
