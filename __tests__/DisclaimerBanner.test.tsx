import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DisclaimerBanner from "@/components/DisclaimerBanner";

describe("DisclaimerBanner", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("shows the disclaimer text by default", async () => {
    render(<DisclaimerBanner />);
    expect(await screen.findByText(/has not been reviewed by a/i)).toBeDefined();
  });

  it("hides itself and records the dismissal when closed", async () => {
    render(<DisclaimerBanner />);
    await screen.findByText(/has not been reviewed by a/i);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss disclaimer" }));

    expect(screen.queryByText(/has not been reviewed by a/i)).toBeNull();
    expect(sessionStorage.getItem("disclaimerBannerDismissed")).toBe("true");
  });

  it("stays hidden on a fresh mount within the same session", async () => {
    sessionStorage.setItem("disclaimerBannerDismissed", "true");
    render(<DisclaimerBanner />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText(/has not been reviewed by a/i)).toBeNull();
  });
});
