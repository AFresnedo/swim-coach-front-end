import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { hasCookie } = vi.hoisted(() => ({ hasCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ has: hasCookie }),
}));

import FreestylePage from "@/app/strokes/freestyle/page";

describe("FreestylePage", () => {
  afterEach(cleanup);

  it("shows drills when the user is logged in", async () => {
    hasCookie.mockReturnValue(true);
    render(await FreestylePage());
    expect(screen.getByText("Catch-Up Drill")).toBeDefined();
  });

  it("hides drills behind a sign-in prompt when logged out", async () => {
    hasCookie.mockReturnValue(false);
    render(await FreestylePage());
    expect(screen.queryByText("Catch-Up Drill")).toBeNull();
    expect(screen.getByText(/sign in to see/i)).toBeDefined();
  });
});
