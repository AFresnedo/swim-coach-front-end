import { describe, expect, it } from "vitest";
import { formatMmSs } from "@/app/swim-log/_lib/swim-times-data";

describe("formatMmSs", () => {
  it("formats sub-minute times", () => {
    expect(formatMmSs(32.1)).toBe("0:32.10");
  });

  it("formats times with minutes", () => {
    expect(formatMmSs(62.35)).toBe("1:02.35");
  });

  it("rolls over into the next minute when seconds round up to 60", () => {
    expect(formatMmSs(59.996)).toBe("1:00.00");
  });
});
