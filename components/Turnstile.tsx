"use client";

import Script from "next/script";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
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
  // Called when Cloudflare's script itself fails to load (ad blocker, CSP
  // blocking challenges.cloudflare.com, network issue) — distinct from
  // onExpire, since here the widget never rendered at all and there's
  // nothing to reset. Without this, sign-up silently stays blocked with no
  // explanation.
  onError: () => void;
};

export function Turnstile({ ref, onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (TURNSTILE_TEST_MODE) {
        onVerify("test-mode-token");
        return;
      }
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (TURNSTILE_TEST_MODE) onVerify("test-mode-token");
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  if (TURNSTILE_TEST_MODE) return null;

  function handleInvalidated() {
    onExpire();
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
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
            "expired-callback": handleInvalidated,
            "error-callback": handleInvalidated,
          });
        }}
        onError={onError}
      />
      <div ref={containerRef} data-testid="turnstile-widget" />
    </>
  );
}
