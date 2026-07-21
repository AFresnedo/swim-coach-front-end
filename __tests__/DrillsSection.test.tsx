import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DrillsSection from "@/app/strokes/[stroke]/_components/DrillsSection";

const drills = [{ name: "Catch-Up Drill", focus: "Timing", desc: "Keep one arm extended." }];

describe("DrillsSection", () => {
  afterEach(cleanup);

  it("shows the drill cards when logged in", () => {
    render(<DrillsSection drills={drills} isLoggedIn={true} />);
    expect(screen.getByText("Catch-Up Drill")).toBeInTheDocument();
    expect(screen.getByText("Keep one arm extended.")).toBeInTheDocument();
    expect(screen.queryByText(/sign in to see/i)).not.toBeInTheDocument();
  });

  it("hides the drills and shows a sign-in prompt when logged out", () => {
    render(<DrillsSection drills={drills} isLoggedIn={false} />);
    expect(screen.queryByText("Catch-Up Drill")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in to see/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/sign-in");
  });
});
