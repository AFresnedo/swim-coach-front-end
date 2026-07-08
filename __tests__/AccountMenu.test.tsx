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
const replace = vi.fn();
const refresh = vi.fn();
// A stable object, matching real next/navigation's useRouter.
const router = { push, replace, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/front-api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/front-api")>();
  return { ...actual, frontApiFetch: vi.fn().mockResolvedValue({ ok: true }) };
});

import { ApiError, frontApiFetch } from "@/lib/front-api";

const mockFetch = vi.mocked(frontApiFetch);

describe("AccountMenu", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

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

  it("shows an error and does not navigate when logout fails", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Server unavailable", 502));
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(await screen.findByText("Server unavailable")).toBeDefined();
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("redirects to sign-in instead of showing an error when the session has already expired", async () => {
    mockFetch.mockRejectedValueOnce(new ApiError("Could not validate credentials", 401));
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in?sessionExpired=1"));
    expect(screen.queryByText("Could not validate credentials")).toBeNull();
  });
});
