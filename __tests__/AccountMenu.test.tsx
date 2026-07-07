import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AccountMenu from "@/components/AccountMenu";

// jsdom doesn't implement ResizeObserver, which Headless UI's Menu uses for anchor positioning.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/front-api")>();
  return { ...actual, frontApiFetch: vi.fn().mockResolvedValue({ ok: true }) };
});

import { frontApiFetch } from "@/lib/front-api";

const mockFetch = vi.mocked(frontApiFetch);

describe("AccountMenu", () => {
  afterEach(cleanup);

  it("hides the menu items until the trigger is clicked", () => {
    render(<AccountMenu />);
    expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeDefined();
  });

  it("links Profile to the profile page", () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    expect(screen.getByRole("menuitem", { name: "Profile" }).getAttribute("href")).toBe("/profile");
  });

  it("logs out and redirects home when Log out is clicked", async () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }),
    );
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalled();
  });
});
