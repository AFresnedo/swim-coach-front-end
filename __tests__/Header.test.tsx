import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ has: () => false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("Header", () => {
  it("links to the strokes page", async () => {
    render(await Header());
    expect(screen.getByRole("link", { name: "Strokes" }).getAttribute("href")).toBe("/strokes");
  });
});
