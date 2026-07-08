"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/front-api";
import { AuthRedirectError, useProtectedFetch } from "@/lib/use-protected-fetch";

export default function AccountMenu() {
  const router = useRouter();
  const protectedFetch = useProtectedFetch();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await protectedFetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof AuthRedirectError) return;
      setError(err instanceof ApiError ? err.message : "Log out failed. Please try again.");
    }
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="group flex items-center gap-1.5 rounded-full border border-cyan-900/10 dark:border-cyan-400/10 px-4 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:border-cyan-900/20 dark:hover:border-cyan-400/20 transition-colors data-[active]:text-slate-900 dark:data-[active]:text-slate-100">
        <svg
          aria-hidden
          role="presentation"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
          />
        </svg>
        Account
        <svg
          aria-hidden
          role="presentation"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 transition-transform group-data-[open]:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        transition
        className="z-[calc(var(--z-header)+10)] w-44 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-lg shadow-cyan-500/5 [--anchor-gap:0.5rem] origin-top transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 data-[focus]:bg-slate-50 dark:data-[focus]:bg-slate-800 data-[focus]:text-slate-900 dark:data-[focus]:text-slate-100"
          >
            Profile
          </Link>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 data-[focus]:bg-slate-50 dark:data-[focus]:bg-slate-800 data-[focus]:text-slate-900 dark:data-[focus]:text-slate-100"
          >
            Log out
          </button>
        </MenuItem>
      </MenuItems>
      {error && (
        <p
          role="alert"
          className="absolute right-0 mt-2 w-56 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 shadow-lg"
        >
          {error}
        </p>
      )}
    </Menu>
  );
}
