import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";
import { fakeJwt } from "./helpers/fake-jwt";

const { cookies } = vi.hoisted(() => ({ cookies: vi.fn() }));

vi.mock("next/headers", () => ({ cookies }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("Header", () => {
  afterEach(cleanup);

  it("links to the strokes page", async () => {
    cookies.mockResolvedValue({ get: () => undefined });
    render(await Header());
    expect(screen.getByRole("link", { name: "Strokes" }).getAttribute("href")).toBe("/strokes");
  });

  it("shows sign-in links, 'Features', and 'How it works' when logged out", async () => {
    cookies.mockResolvedValue({ get: () => undefined });
    render(await Header());
    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Get started" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Features" })).toBeDefined();
    expect(screen.getByRole("link", { name: "How it works" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Goals" })).toBeNull();
  });

  it("shows Goals and the account menu, but hides 'Features' and 'How it works', when logged in", async () => {
    cookies.mockResolvedValue({ get: () => ({ value: fakeJwt(3600) }) });
    render(await Header());
    expect(screen.getByRole("link", { name: "Goals" }).getAttribute("href")).toBe("/goals");
    expect(screen.getByRole("button", { name: /account/i })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Features" })).toBeNull();
    expect(screen.queryByRole("link", { name: "How it works" })).toBeNull();
  });
});
