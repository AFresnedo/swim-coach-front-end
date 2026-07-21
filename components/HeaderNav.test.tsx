import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeaderNav from "@/components/HeaderNav";

vi.mock("@/components/AccountMenu", () => ({
  default: () => <div>Account Menu</div>,
}));

describe("HeaderNav", () => {
  afterEach(cleanup);

  it("toggles the mobile menu button's expanded state and label on click", () => {
    render(<HeaderNav isLoggedIn={false} />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes the mobile menu when a nav link is clicked", () => {
    render(<HeaderNav isLoggedIn={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Strokes" }));

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows marketing links and sign-in/sign-up when logged out", () => {
    render(<HeaderNav isLoggedIn={false} />);
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How it works" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get started" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Goals" })).not.toBeInTheDocument();
    expect(screen.queryByText("Account Menu")).not.toBeInTheDocument();
  });

  it("shows app links and the account menu when logged in, hiding marketing links", () => {
    render(<HeaderNav isLoggedIn={true} />);
    expect(screen.getByRole("link", { name: "Swim Log" }).getAttribute("href")).toBe("/swim-log");
    expect(screen.getByRole("link", { name: "Goals" }).getAttribute("href")).toBe("/goals");
    expect(screen.getByText("Account Menu")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });
});
