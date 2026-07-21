"use client";

import Script from "next/script";
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TURNSTILE_TEST_MODE } from "@/shared/constants";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = {
  // Call after any failed submission so a fresh, unconsumed token is issued
  // — Cloudflare tokens are single-use, so re-submitting the same token
  // always fails even when the failure had nothing to do with the CAPTCHA.
  reset: () => void;
};

type TurnstileProps = {
  ref?: Ref<TurnstileHandle>;
  onVerify: (token: string) => void;
  onExpire: () => void;
  // Called both when Cloudflare's script itself fails to load (ad blocker,
  // CSP blocking challenges.cloudflare.com, network issue) and when a
  // rendered widget reports its own error-callback (e.g. a bad/mismatched
  // site key) — distinct from onExpire, which covers the benign case of a
  // token simply timing out. Without this, sign-up silently stays blocked
  // with no explanation.
  onError: () => void;
};

export function Turnstile({ ref, onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Clears the caller's token and re-arms the widget (a no-op in test mode,
  // since no real widget is ever rendered) — shared by the widget's own
  // expired-callback below and the caller-facing reset() right after.
  const invalidate = useCallback(() => {
    onExpire();
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [onExpire]);

  useImperativeHandle(
    ref,
    () => ({
      // So the caller only has to call reset() and can't forget to also
      // clear its copy of the token.
      reset: () => {
        invalidate();
        if (TURNSTILE_TEST_MODE) onVerify("test-mode-token");
      },
    }),
    [onVerify, invalidate],
  );

  useEffect(() => {
    if (TURNSTILE_TEST_MODE) onVerify("test-mode-token");
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  if (TURNSTILE_TEST_MODE) return null;

  // Unlike expiry, a widget-reported error (e.g. a bad/mismatched site key)
  // isn't benign — surface it via onError rather than silently re-arming.
  function handleWidgetError() {
    invalidate();
    onError();
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          if (!containerRef.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: onVerify,
            "expired-callback": invalidate,
            "error-callback": handleWidgetError,
          });
        }}
        onError={onError}
      />
      <div ref={containerRef} data-testid="turnstile-widget" />
    </>
  );
}
