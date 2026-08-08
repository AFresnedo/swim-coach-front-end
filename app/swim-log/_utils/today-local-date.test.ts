import { afterEach, describe, expect, it, vi } from "vitest";
import { todayLocalDate } from "@/app/swim-log/_utils/today-local-date";

describe("todayLocalDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("zero-pads a single-digit month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 23));
    expect(todayLocalDate()).toBe("2026-01-23");
  });

  it("zero-pads a single-digit day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5));
    expect(todayLocalDate()).toBe("2026-11-05");
  });

  it("formats double-digit month and day without extra padding", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31));
    expect(todayLocalDate()).toBe("2026-12-31");
  });
});
