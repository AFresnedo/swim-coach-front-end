import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TurnstileHandle } from "@/app/sign-up/_components/Turnstile";

const { scriptProps } = vi.hoisted(() => ({
  scriptProps: { current: null as null | { onReady?: () => void; onError?: () => void } },
}));

vi.mock("next/script", () => ({
  default: (props: { onReady?: () => void; onError?: () => void }) => {
    scriptProps.current = props;
    // Defer past the commit phase so the widget's container ref is attached
    // by the time onReady fires, matching real script-load timing.
    setTimeout(() => props.onReady?.(), 0);
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
    const { Turnstile } = await import("@/app/sign-up/_components/Turnstile");
    const onVerify = vi.fn();

    const { container } = render(
      <Turnstile onVerify={onVerify} onExpire={vi.fn()} onError={vi.fn()} />,
    );

    expect(onVerify).toHaveBeenCalledWith("test-mode-token");
    expect(container.innerHTML).toBe("");
  });

  it("renders the real widget and wires verify/expire callbacks", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    vi.resetModules();
    const { Turnstile } = await import("@/app/sign-up/_components/Turnstile");

    const renderWidget = vi.fn().mockReturnValue("widget-id");
    const resetWidget = vi.fn();
    window.turnstile = { render: renderWidget, remove: vi.fn(), reset: resetWidget };

    const onVerify = vi.fn();
    const onExpire = vi.fn();
    const onError = vi.fn();
    render(<Turnstile onVerify={onVerify} onExpire={onExpire} onError={onError} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-site-key" }),
    );

    const options = renderWidget.mock.calls[0][1] as Record<string, (arg?: string) => void>;
    options.callback?.("real-token");
    expect(onVerify).toHaveBeenCalledWith("real-token");

    options["expired-callback"]?.();
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(resetWidget).toHaveBeenCalledWith("widget-id");
    expect(onError).not.toHaveBeenCalled();

    options["error-callback"]?.();
    expect(onExpire).toHaveBeenCalledTimes(2);
    expect(resetWidget).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("calls onError when the Cloudflare script itself fails to load", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    vi.resetModules();
    const { Turnstile } = await import("@/app/sign-up/_components/Turnstile");

    const onError = vi.fn();
    render(<Turnstile onVerify={vi.fn()} onExpire={vi.fn()} onError={onError} />);

    expect(scriptProps.current?.onError).toBeDefined();
    scriptProps.current?.onError?.();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("clears the caller's token and re-arms the widget when the parent calls reset() after a failed submit", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    vi.resetModules();
    const { Turnstile } = await import("@/app/sign-up/_components/Turnstile");

    const resetWidget = vi.fn();
    window.turnstile = {
      render: vi.fn().mockReturnValue("widget-id"),
      remove: vi.fn(),
      reset: resetWidget,
    };

    const onExpire = vi.fn();
    const ref = createRef<TurnstileHandle>();
    render(<Turnstile ref={ref} onVerify={vi.fn()} onExpire={onExpire} onError={vi.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    ref.current?.reset();

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(resetWidget).toHaveBeenCalledWith("widget-id");
  });

  it("reset() clears the caller's token and re-issues the test-mode token in test mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_TEST_MODE", "true");
    vi.resetModules();
    const { Turnstile } = await import("@/app/sign-up/_components/Turnstile");

    const onVerify = vi.fn();
    const onExpire = vi.fn();
    const ref = createRef<TurnstileHandle>();
    render(<Turnstile ref={ref} onVerify={onVerify} onExpire={onExpire} onError={vi.fn()} />);

    expect(onVerify).toHaveBeenCalledTimes(1);
    ref.current?.reset();
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onVerify).toHaveBeenCalledTimes(2);
    expect(onVerify).toHaveBeenLastCalledWith("test-mode-token");
  });
});
