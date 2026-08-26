import { describe, expect, it } from "vitest";
import { getStroke, strokes } from "@/shared/content/strokes";

describe("getStroke", () => {
  it("returns the matching stroke for a known slug", () => {
    expect(getStroke("freestyle")).toBe(strokes[0]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getStroke("sidestroke")).toBeUndefined();
  });
});
