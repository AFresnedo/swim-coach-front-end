"use client";

import { useRouter } from "next/navigation";
import { frontApiFetch } from "@/lib/api";

export default function UserNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await frontApiFetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn) {
    return (
      <>
        <a
          href="/goals"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Goals
        </a>
        <a
          href="/profile"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Profile
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-gradient-aqua px-4 py-2 text-white shadow-aqua hover:brightness-110 transition-[filter]"
        >
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <a
        href="/sign-in"
        className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        Sign in
      </a>
      <a
        href="/sign-up"
        className="rounded-full bg-gradient-aqua px-4 py-2 text-white shadow-aqua hover:brightness-110 transition-[filter]"
      >
        Get started
      </a>
    </>
  );
}
