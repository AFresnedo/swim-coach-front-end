import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeJwt } from "@/test-helpers/fake-jwt";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ get: getCookie }),
}));

import StrokePage, { GatedDrills } from "@/app/strokes/[stroke]/page";

// GatedDrills sits behind a DynamicHole (Suspense) boundary in StrokePage,
// so it's tested directly here rather than through StrokePage — React
// Testing Library's synchronous render() doesn't resolve an async Server
// Component nested inside Suspense the way Next's real RSC pipeline does.
describe("GatedDrills", () => {
  afterEach(cleanup);

  it("shows drills when the user is logged in", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    render(await GatedDrills({ slug: "freestyle" }));
    expect(screen.getByText("Catch-Up Drill")).toBeInTheDocument();
  });

  it("hides drills behind a sign-in prompt when logged out", async () => {
    getCookie.mockReturnValue(undefined);
    render(await GatedDrills({ slug: "freestyle" }));
    expect(screen.queryByText("Catch-Up Drill")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to see/i)).toBeInTheDocument();
  });

  it("renders notFound for an unknown stroke slug", async () => {
    getCookie.mockReturnValue({ value: fakeJwt(3600) });
    await expect(GatedDrills({ slug: "sidestroke" })).rejects.toThrow();
  });
});

describe("StrokePage", () => {
  afterEach(cleanup);

  it("renders the stroke's header content", async () => {
    render(
      await StrokePage({
        params: Promise.resolve({ stroke: "freestyle" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByRole("heading", { name: /freestyle/i })).toBeInTheDocument();
    expect(screen.getByText(/fastest and most versatile stroke/i)).toBeInTheDocument();
  });

  it("renders notFound for an unknown stroke slug", async () => {
    await expect(
      StrokePage({
        params: Promise.resolve({ stroke: "sidestroke" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });
});
