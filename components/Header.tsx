import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import { checkLoggedIn } from "@/lib/auth";

export default async function Header() {
  const isLoggedIn = await checkLoggedIn();

  return (
    <header className="sticky top-0 z-[var(--z-header)] flex items-center justify-between px-4 sm:px-8 py-5 border-b border-cyan-900/10 dark:border-cyan-400/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <Link href="/" className="text-xl font-bold tracking-tight text-gradient-aqua">
        SwimCoach
      </Link>
      <HeaderNav isLoggedIn={isLoggedIn} />
    </header>
  );
}
