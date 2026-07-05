import { cookies } from "next/headers";
import AccountMenu from "@/components/AccountMenu";
import { AUTH_COOKIE } from "@/lib/constants";

export default async function Header() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(AUTH_COOKIE);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-cyan-900/10 dark:border-cyan-400/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <a href="/" className="text-xl font-bold tracking-tight text-gradient-aqua">
        SwimCoach
      </a>
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
        <a
          href="/#features"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Features
        </a>
        <a
          href="/#how-it-works"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          How it works
        </a>
        <a
          href="/strokes"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Strokes
        </a>
        {isLoggedIn ? (
          <>
            <a
              href="/goals"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Goals
            </a>
            <AccountMenu />
          </>
        ) : (
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
        )}
      </nav>
    </header>
  );
}
