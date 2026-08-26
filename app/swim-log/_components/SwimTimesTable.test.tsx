import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SwimTimesTable from "@/app/swim-log/_components/SwimTimesTable";
import type { SwimTime } from "@/app/swim-log/_data/swim-times";
import type { SwimTimesResults } from "@/app/swim-log/_hooks/use-swim-times-query";

function makeResults(overrides: Partial<SwimTimesResults> = {}): SwimTimesResults {
  return {
    times: [],
    nextCursor: null,
    loading: false,
    loadingMore: false,
    error: "",
    handleLoadMore: vi.fn(),
    ...overrides,
  };
}

const swimTime: SwimTime = {
  id: 1,
  user_id: 1,
  date: "2026-01-01",
  stroke: "freestyle",
  course: "scy",
  length: 50,
  attempt_number: 1,
  time_seconds: 32.1,
  is_official: true,
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("SwimTimesTable", () => {
  afterEach(cleanup);

  it("shows the error message when results.error is set", () => {
    render(
      <SwimTimesTable results={makeResults({ error: "Server error" })} hasActiveFilters={false} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Server error");
  });

  it("shows a loading message on first load before any times have arrived", () => {
    render(<SwimTimesTable results={makeResults({ loading: true })} hasActiveFilters={false} />);
    expect(screen.getByText("Loading times…")).toBeInTheDocument();
  });

  it("shows an unfiltered empty-state message when there are no times and no filters", () => {
    render(<SwimTimesTable results={makeResults()} hasActiveFilters={false} />);
    expect(screen.getByText(/no times logged for this date yet/i)).toBeInTheDocument();
  });

  it("shows a filtered empty-state message when there are no times and a filter is active", () => {
    render(<SwimTimesTable results={makeResults()} hasActiveFilters={true} />);
    expect(screen.getByText(/no times match these filters/i)).toBeInTheDocument();
  });

  it("renders a row with labels, formatted time, and a notes fallback", () => {
    render(
      <SwimTimesTable results={makeResults({ times: [swimTime] })} hasActiveFilters={false} />,
    );

    expect(screen.getByRole("cell", { name: "Freestyle" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "SCY (short course yards)" })).toBeInTheDocument();
    expect(screen.getByText("0:32.10")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Yes" })).toBeInTheDocument();
  });

  it("shows the Load more button only when a next cursor is present, and wires it to handleLoadMore", () => {
    const handleLoadMore = vi.fn();
    render(
      <SwimTimesTable
        results={makeResults({ times: [swimTime], nextCursor: "abc", handleLoadMore })}
        hasActiveFilters={false}
      />,
    );

    const button = screen.getByRole("button", { name: "Load more" });
    fireEvent.click(button);
    expect(handleLoadMore).toHaveBeenCalled();
  });

  it("hides the Load more button when there is no next cursor", () => {
    render(
      <SwimTimesTable results={makeResults({ times: [swimTime] })} hasActiveFilters={false} />,
    );
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("shows a loading label on the Load more button while loading more", () => {
    render(
      <SwimTimesTable
        results={makeResults({ times: [swimTime], nextCursor: "abc", loadingMore: true })}
        hasActiveFilters={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
  });
});
