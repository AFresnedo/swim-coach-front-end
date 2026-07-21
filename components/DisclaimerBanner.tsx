"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "disclaimerBannerDismissed";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    setVisible(sessionStorage.getItem(DISMISSED_KEY) !== "true");
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-amber-200 border-b bg-amber-100 px-4 py-2.5 text-amber-900 text-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <p className="text-center">
        <span aria-hidden="true">⚠️</span> Information on this site has not been reviewed by a
        licensed swim coach, physical therapist, or medical professional. Verify anything you use
        here with a trusted source before relying on it — use at your own risk.{" "}
        <Link href="/disclaimer" className="font-medium underline underline-offset-2">
          Learn more
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISSED_KEY, "true");
          setVisible(false);
        }}
        aria-label="Dismiss disclaimer"
        className="shrink-0 rounded-full p-1 transition-colors hover:bg-amber-200/60 dark:hover:bg-amber-900/60"
      >
        ✕
      </button>
    </div>
  );
}
