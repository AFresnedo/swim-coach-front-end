import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TurnstileHandle } from "@/components/Turnstile";

vi.mock("next/script", () => ({
  default: ({ onReady }: { onReady?: () => void }) => {
    // Defer past the commit phase so the widget's container ref is attached
    // by the time onReady fires, matching real script-load timing.
    setTimeout(() => onReady?.(), 0);
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

  it("re-arms the widget for a fresh token when the parent calls reset() after a failed submit", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    vi.resetModules();
    const { Turnstile } = await import("@/components/Turnstile");

    const resetWidget = vi.fn();
    window.turnstile = {
      render: vi.fn().mockReturnValue("widget-id"),
      remove: vi.fn(),
      reset: resetWidget,
    };

    const ref = createRef<TurnstileHandle>();
    render(<Turnstile ref={ref} onVerify={vi.fn()} onExpire={vi.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    ref.current?.reset();

    expect(resetWidget).toHaveBeenCalledWith("widget-id");
  });

  it("reset() re-issues the test-mode token in test mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.resetModules();
    const { Turnstile } = await import("@/components/Turnstile");

    const onVerify = vi.fn();
    const ref = createRef<TurnstileHandle>();
    render(<Turnstile ref={ref} onVerify={onVerify} onExpire={vi.fn()} />);

    expect(onVerify).toHaveBeenCalledTimes(1);
    ref.current?.reset();
    expect(onVerify).toHaveBeenCalledTimes(2);
    expect(onVerify).toHaveBeenLastCalledWith("test-mode-token");
  });
});
