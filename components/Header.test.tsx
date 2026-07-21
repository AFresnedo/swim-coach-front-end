import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";
import { fakeJwt } from "@/test-helpers/fake-jwt";

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
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How it works" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Goals" })).not.toBeInTheDocument();
  });

  it("shows Goals and the account menu, but hides 'Features' and 'How it works', when logged in", async () => {
    cookies.mockResolvedValue({ get: () => ({ value: fakeJwt(3600) }) });
    render(await Header());
    expect(screen.getByRole("link", { name: "Goals" }).getAttribute("href")).toBe("/goals");
    expect(screen.getByRole("button", { name: /account/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "How it works" })).not.toBeInTheDocument();
  });
});
