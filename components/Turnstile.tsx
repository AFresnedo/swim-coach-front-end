"use client";

import Script from "next/script";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";

// Bypasses the widget entirely (no script load, no network call to Cloudflare)
// when true. Only ever set in .env.local for local dev/e2e — never in
// ../infra's staging/prod env config, or sign-up would ship with no CAPTCHA.
// Read via the NEXT_PUBLIC_ name everywhere (including server-side in
// app/api/auth/register/route.ts) so there's a single flag to set, not two
// independently-named ones that can drift out of sync.
const TEST_MODE = process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "true";
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
};

export function Turnstile({ ref, onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (TEST_MODE) {
        onVerify("test-mode-token");
        return;
      }
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (TEST_MODE) onVerify("test-mode-token");
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  if (TEST_MODE) return null;

  function handleInvalidated() {
    onExpire();
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          if (!containerRef.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: onVerify,
            "expired-callback": handleInvalidated,
            "error-callback": handleInvalidated,
          });
        }}
      />
      <div ref={containerRef} data-testid="turnstile-widget" />
    </>
  );
}
