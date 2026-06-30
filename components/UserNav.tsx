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
          href="/profile"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Profile
        </a>
        <button
          onClick={handleLogout}
          className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <a href="/sign-in" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        Sign in
      </a>
      <a
        href="/sign-up"
        className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Get started
      </a>
    </>
  );
}
