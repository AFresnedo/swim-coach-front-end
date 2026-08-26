import { describe, expect, it } from "vitest";
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg } from "@/app/profile/_utils/unit-conversion";

describe("cmToFtIn", () => {
  it("converts centimeters to feet and inches", () => {
    expect(cmToFtIn(177.8)).toEqual({ ft: 5, inches: 10 });
  });

  it("rolls over into the next foot when inches round up to 12", () => {
    expect(cmToFtIn(182.8)).toEqual({ ft: 6, inches: 0 });
  });
});

describe("kgToLbs", () => {
  it("converts kilograms to whole pounds", () => {
    expect(kgToLbs(69.9)).toBe(154);
  });
});

describe("ftInToCm", () => {
  it("converts feet and inches to centimeters", () => {
    expect(ftInToCm(5, 10)).toBe(177.8);
  });
});

describe("lbsToKg", () => {
  it("converts pounds to kilograms", () => {
    expect(lbsToKg(154)).toBe(69.9);
  });
});
