"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Bypasses the widget entirely (no script load, no network call to Cloudflare)
// when true. Only ever set in .env.local for local dev/e2e — never in
// ../infra's staging/prod env config, or sign-up would ship with no CAPTCHA.
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

type TurnstileProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
};

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (TEST_MODE) onVerify("test-mode-token");
  }, [onVerify]);

  useEffect(() => {
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  if (TEST_MODE) return null;

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
            "expired-callback": () => {
              onExpire();
              if (widgetId.current) window.turnstile?.reset(widgetId.current);
            },
            "error-callback": () => {
              onExpire();
              if (widgetId.current) window.turnstile?.reset(widgetId.current);
            },
          });
        }}
      />
      <div ref={containerRef} data-testid="turnstile-widget" />
    </>
  );
}
