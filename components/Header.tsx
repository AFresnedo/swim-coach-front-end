import Link from "next/link";
import AccountMenu from "@/components/AccountMenu";
import { checkLoggedIn } from "@/lib/auth";

export default async function Header() {
  const isLoggedIn = await checkLoggedIn();

  return (
    <header className="sticky top-0 z-[var(--z-header)] flex items-center justify-between px-8 py-5 border-b border-cyan-900/10 dark:border-cyan-400/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <Link href="/" className="text-xl font-bold tracking-tight text-gradient-aqua">
        SwimCoach
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
        {!isLoggedIn && (
          <>
            <Link
              href="/#features"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              How it works
            </Link>
          </>
        )}
        <Link
          href="/strokes"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Strokes
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              href="/swim-log"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Swim Log
            </Link>
            <Link
              href="/goals"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Goals
            </Link>
            <AccountMenu />
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-aqua px-4 py-2 text-white shadow-aqua hover:brightness-110 transition-[filter]"
            >
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
