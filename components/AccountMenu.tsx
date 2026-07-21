"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/lib/use-protected-front-fetch";

export default function AccountMenu() {
  const router = useRouter();
  const protectedFrontFetch = useProtectedFrontFetch();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await protectedFrontFetch("/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      const message = protectedErrorMessage(err, "Log out failed. Please try again.");
      if (message) setError(message);
    }
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="group flex items-center gap-1.5 rounded-full border border-cyan-900/10 px-4 py-2 transition-colors hover:border-cyan-900/20 hover:text-slate-900 data-[active]:text-slate-900 dark:border-cyan-400/10 dark:data-[active]:text-slate-100 dark:hover:border-cyan-400/20 dark:hover:text-slate-100">
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
        className="z-[calc(var(--z-header)+10)] w-44 origin-top rounded-xl border border-slate-100 bg-white py-1.5 shadow-cyan-500/5 shadow-lg transition duration-100 ease-out [--anchor-gap:0.5rem] data-[closed]:scale-95 data-[closed]:opacity-0 dark:border-slate-800 dark:bg-slate-900"
      >
        <MenuItem>
          <Link
            href="/profile"
            className="block px-4 py-2 text-slate-600 text-sm data-[focus]:bg-slate-50 data-[focus]:text-slate-900 dark:text-slate-400 dark:data-[focus]:bg-slate-800 dark:data-[focus]:text-slate-100"
          >
            Profile
          </Link>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-slate-600 text-sm data-[focus]:bg-slate-50 data-[focus]:text-slate-900 dark:text-slate-400 dark:data-[focus]:bg-slate-800 dark:data-[focus]:text-slate-100"
          >
            Log out
          </button>
        </MenuItem>
      </MenuItems>
      {error && (
        <p
          role="alert"
          className="absolute right-0 mt-2 w-56 rounded-lg bg-red-50 px-3 py-2 text-red-600 text-xs shadow-lg dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </Menu>
  );
}
