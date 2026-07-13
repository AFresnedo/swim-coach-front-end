"use client";

import Script from "next/script";
import { type Ref, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TURNSTILE_TEST_MODE } from "@/lib/constants";

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

  // Memoized (not a plain function) so it can be listed in
  // useImperativeHandle's deps below without forcing that factory to
  // reallocate every render — [] is correct since widgetId is a ref.
  const reArmWidget = useCallback(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      // Clears the caller's token before re-arming, same as the widget's own
      // expired/error handling below — so the caller only has to call
      // reset() and can't forget to also clear its copy of the token.
      reset: () => {
        onExpire();
        if (TURNSTILE_TEST_MODE) {
          onVerify("test-mode-token");
          return;
        }
        reArmWidget();
      },
    }),
    [onVerify, onExpire, reArmWidget],
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

  function handleExpired() {
    onExpire();
    reArmWidget();
  }

  // Unlike expiry, a widget-reported error (e.g. a bad/mismatched site key)
  // isn't benign — surface it via onError rather than silently re-arming.
  function handleWidgetError() {
    onExpire();
    reArmWidget();
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
            "expired-callback": handleExpired,
            "error-callback": handleWidgetError,
          });
        }}
        onError={onError}
      />
      <div ref={containerRef} data-testid="turnstile-widget" />
    </>
  );
}
