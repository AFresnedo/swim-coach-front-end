import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import { checkLoggedIn } from "@/shared/auth";

const headerClass =
  "sticky top-0 z-[var(--z-header)] flex items-center justify-between border-cyan-900/10 border-b bg-white/80 px-4 py-5 backdrop-blur-md sm:px-8 dark:border-cyan-400/10 dark:bg-slate-950/80";

// Shown in place of Header while checkLoggedIn's cookie read resolves, so
// cacheComponents-cached pages don't have to block their whole static shell
// on it. Shares headerClass with Header itself so the two can't drift apart
// and cause a layout shift when the real header streams in.
export function HeaderFallback() {
  return (
    <header className={headerClass}>
      <Link href="/" className="font-bold text-gradient-aqua text-xl tracking-tight">
        SwimCoach
      </Link>
    </header>
  );
}

export default async function Header() {
  const isLoggedIn = await checkLoggedIn();

  return (
    <header className={headerClass}>
      <Link href="/" className="font-bold text-gradient-aqua text-xl tracking-tight">
        SwimCoach
      </Link>
      <HeaderNav isLoggedIn={isLoggedIn} />
    </header>
  );
}
