import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: ({ onLoad }: { onLoad?: () => void }) => {
    // Defer past the commit phase so the widget's container ref is attached
    // by the time onLoad fires, matching real script-load timing.
    setTimeout(() => onLoad?.(), 0);
    return null;
  },
}));

describe("Turnstile", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.resetModules();
    window.turnstile = undefined;
  });

  it("bypasses the widget and verifies immediately in test mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.resetModules();
    const { Turnstile } = await import("@/components/Turnstile");
    const onVerify = vi.fn();

    const { container } = render(<Turnstile onVerify={onVerify} onExpire={vi.fn()} />);

    expect(onVerify).toHaveBeenCalledWith("test-mode-token");
    expect(container.innerHTML).toBe("");
  });

  it("renders the real widget and wires verify/expire callbacks", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    vi.resetModules();
    const { Turnstile } = await import("@/components/Turnstile");

    const renderWidget = vi.fn().mockReturnValue("widget-id");
    const resetWidget = vi.fn();
    window.turnstile = { render: renderWidget, remove: vi.fn(), reset: resetWidget };

    const onVerify = vi.fn();
    const onExpire = vi.fn();
    render(<Turnstile onVerify={onVerify} onExpire={onExpire} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-site-key" }),
    );

    const options = renderWidget.mock.calls[0][1] as Record<string, (arg?: string) => void>;
    options.callback?.("real-token");
    expect(onVerify).toHaveBeenCalledWith("real-token");

    options["expired-callback"]?.();
    expect(onExpire).toHaveBeenCalled();
    expect(resetWidget).toHaveBeenCalledWith("widget-id");

    options["error-callback"]?.();
    expect(resetWidget).toHaveBeenCalledTimes(2);
  });
});
