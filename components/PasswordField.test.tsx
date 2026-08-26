import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordField } from "@/components/PasswordField";

describe("PasswordField", () => {
  afterEach(cleanup);

  it("masks the value by default", () => {
    render(
      <PasswordField
        label="Password"
        value="secret"
        onChange={vi.fn()}
        autoComplete="current-password"
      />,
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  });

  it("reveals the value as plain text when the visibility toggle is clicked", () => {
    render(
      <PasswordField
        label="Password"
        value="secret"
        onChange={vi.fn()}
        autoComplete="current-password"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
    expect(screen.getByText("Password is now shown")).toBeInTheDocument();
  });

  it("hides it again on a second click", () => {
    render(
      <PasswordField
        label="Password"
        value="secret"
        onChange={vi.fn()}
        autoComplete="current-password"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("forwards typed input to onChange", () => {
    const onChange = vi.fn();
    render(
      <PasswordField
        label="Password"
        value=""
        onChange={onChange}
        autoComplete="current-password"
      />,
    );

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "new-value" } });
    expect(onChange).toHaveBeenCalledWith("new-value");
  });

  it("shows a field-level error message", () => {
    render(
      <PasswordField
        label="Password"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
        error="Password is too short"
      />,
    );
    expect(screen.getByText("Password is too short")).toBeInTheDocument();
  });
});
