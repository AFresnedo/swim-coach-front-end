import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwimCountStat, SwimmerCountStat } from "@/app/_components/Stat";

vi.mock("@/app/_data/stats", () => ({
  getUserCount: vi.fn(),
  getSwimCount: vi.fn(),
}));

import { getSwimCount, getUserCount } from "@/app/_data/stats";

describe("SwimmerCountStat", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the locale-formatted count on success", async () => {
    vi.mocked(getUserCount).mockResolvedValue(12345);
    render(await SwimmerCountStat());
    expect(screen.getByText("12,345")).toBeInTheDocument();
  });

  it("falls back to 'Fetching...' instead of showing nothing when the count is unavailable", async () => {
    vi.mocked(getUserCount).mockResolvedValue(null);
    render(await SwimmerCountStat());
    expect(screen.getByText("Fetching...")).toBeInTheDocument();
  });
});

describe("SwimCountStat", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the locale-formatted count on success", async () => {
    vi.mocked(getSwimCount).mockResolvedValue(987654);
    render(await SwimCountStat());
    expect(screen.getByText("987,654")).toBeInTheDocument();
  });

  it("falls back to 'Fetching...' instead of showing nothing when the count is unavailable", async () => {
    vi.mocked(getSwimCount).mockResolvedValue(null);
    render(await SwimCountStat());
    expect(screen.getByText("Fetching...")).toBeInTheDocument();
  });
});
