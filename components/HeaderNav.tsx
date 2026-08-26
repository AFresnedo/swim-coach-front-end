"use client";

import Link from "next/link";
import { useState } from "react";
import AccountMenu from "@/components/AccountMenu";

export default function HeaderNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="primary-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex items-center justify-center rounded-full border border-cyan-900/10 p-2 text-slate-600 transition-colors hover:border-cyan-900/20 hover:text-slate-900 md:hidden dark:border-cyan-400/10 dark:text-slate-400 dark:hover:border-cyan-400/20 dark:hover:text-slate-100"
      >
        {open ? (
          <svg
            aria-hidden
            role="presentation"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            aria-hidden
            role="presentation"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
        )}
      </button>

      <nav
        id="primary-nav"
        className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-4 border-cyan-900/10 border-b bg-white/95 px-6 py-4 font-medium text-slate-600 text-sm backdrop-blur-md md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none dark:border-cyan-400/10 dark:bg-slate-950/95 dark:text-slate-400 dark:md:bg-transparent`}
      >
        {!isLoggedIn && (
          <>
            <Link
              href="/#features"
              onClick={close}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={close}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              How it works
            </Link>
          </>
        )}
        <Link
          href="/strokes"
          onClick={close}
          className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
        >
          Strokes
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              href="/swim-log"
              onClick={close}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              Swim Log
            </Link>
            <Link
              href="/goals"
              onClick={close}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              Goals
            </Link>
            <AccountMenu />
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              onClick={close}
              className="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={close}
              className="rounded-full bg-gradient-aqua px-4 py-2 text-center text-white shadow-aqua transition-[filter] hover:brightness-110"
            >
              Get started
            </Link>
          </>
        )}
      </nav>
    </>
  );
}
