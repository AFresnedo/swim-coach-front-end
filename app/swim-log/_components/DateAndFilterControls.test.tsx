import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DateAndFilterControls from "@/app/swim-log/_components/DateAndFilterControls";
import type { SwimTimesFilters } from "@/app/swim-log/_hooks/use-swim-times-query";

function makeFilters(overrides: Partial<SwimTimesFilters> = {}): SwimTimesFilters {
  return {
    filterStroke: "",
    setFilterStroke: vi.fn(),
    filterCourse: "",
    setFilterCourse: vi.fn(),
    filterLength: "",
    setFilterLength: vi.fn(),
    filterLengthError: null,
    filterOfficial: "",
    setFilterOfficial: vi.fn(),
    hasActiveFilters: false,
    ...overrides,
  };
}

describe("DateAndFilterControls", () => {
  afterEach(cleanup);

  it("forwards a date change to setSelectedDate", () => {
    const setSelectedDate = vi.fn();
    render(
      <DateAndFilterControls
        selectedDate="2026-01-01"
        setSelectedDate={setSelectedDate}
        filters={makeFilters()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-02-14" } });
    expect(setSelectedDate).toHaveBeenCalledWith("2026-02-14");
  });

  it("forwards each filter change to its own setter", () => {
    const filters = makeFilters();
    render(
      <DateAndFilterControls
        selectedDate="2026-01-01"
        setSelectedDate={vi.fn()}
        filters={filters}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filter by stroke"), {
      target: { value: "backstroke" },
    });
    expect(filters.setFilterStroke).toHaveBeenCalledWith("backstroke");

    fireEvent.change(screen.getByLabelText("Filter by course"), { target: { value: "lcm" } });
    expect(filters.setFilterCourse).toHaveBeenCalledWith("lcm");

    fireEvent.change(screen.getByLabelText("Filter by length"), { target: { value: "100" } });
    expect(filters.setFilterLength).toHaveBeenCalledWith("100");

    fireEvent.change(screen.getByLabelText("Filter by official status"), {
      target: { value: "true" },
    });
    expect(filters.setFilterOfficial).toHaveBeenCalledWith("true");
  });

  it("shows the length filter's validation error", () => {
    render(
      <DateAndFilterControls
        selectedDate="2026-01-01"
        setSelectedDate={vi.fn()}
        filters={makeFilters({ filterLengthError: "Length must be a positive whole number." })}
      />,
    );

    expect(screen.getByText("Length must be a positive whole number.")).toBeInTheDocument();
  });

  it("hides the Clear filters button when no filter is active", () => {
    render(
      <DateAndFilterControls
        selectedDate="2026-01-01"
        setSelectedDate={vi.fn()}
        filters={makeFilters({ hasActiveFilters: false })}
      />,
    );

    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("clears every filter when Clear filters is clicked", () => {
    const filters = makeFilters({ hasActiveFilters: true, filterStroke: "backstroke" });
    render(
      <DateAndFilterControls
        selectedDate="2026-01-01"
        setSelectedDate={vi.fn()}
        filters={filters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(filters.setFilterStroke).toHaveBeenCalledWith("");
    expect(filters.setFilterCourse).toHaveBeenCalledWith("");
    expect(filters.setFilterLength).toHaveBeenCalledWith("");
    expect(filters.setFilterOfficial).toHaveBeenCalledWith("");
  });
});
