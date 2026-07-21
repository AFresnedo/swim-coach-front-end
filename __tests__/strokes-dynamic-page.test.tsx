import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "./helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import StrokePage from "@/app/strokes/[stroke]/page";

describe("StrokePage", () => {
  afterEach(cleanup);

  it("shows drills when the user is logged in", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    render(
      await StrokePage({
        params: Promise.resolve({ stroke: "freestyle" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByText("Catch-Up Drill")).toBeInTheDocument();
  });

  it("hides drills behind a sign-in prompt when logged out", async () => {
    getCookie.mockReturnValue(undefined);
    render(
      await StrokePage({
        params: Promise.resolve({ stroke: "freestyle" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.queryByText("Catch-Up Drill")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to see/i)).toBeInTheDocument();
  });

  it("renders notFound for an unknown stroke slug", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    await expect(
      StrokePage({
        params: Promise.resolve({ stroke: "sidestroke" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });
});
