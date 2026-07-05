import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";

const { cookies } = vi.hoisted(() => ({ cookies: vi.fn() }));

vi.mock("next/headers", () => ({ cookies }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("Header", () => {
  afterEach(cleanup);

  it("links to the strokes page", async () => {
    cookies.mockResolvedValue({ has: () => false });
    render(await Header());
    expect(screen.getByRole("link", { name: "Strokes" }).getAttribute("href")).toBe("/strokes");
  });

  it("shows sign-in links when logged out", async () => {
    cookies.mockResolvedValue({ has: () => false });
    render(await Header());
    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Get started" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Goals" })).toBeNull();
  });

  it("shows Goals and the account menu when logged in", async () => {
    cookies.mockResolvedValue({ has: () => true });
    render(await Header());
    expect(screen.getByRole("link", { name: "Goals" }).getAttribute("href")).toBe("/goals");
    expect(screen.getByRole("button", { name: /account/i })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });
});
