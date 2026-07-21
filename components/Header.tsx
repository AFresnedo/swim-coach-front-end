import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import { checkLoggedIn } from "@/shared/auth";

export default async function Header() {
  const isLoggedIn = await checkLoggedIn();

  return (
    <header className="sticky top-0 z-[var(--z-header)] flex items-center justify-between border-cyan-900/10 border-b bg-white/80 px-4 py-5 backdrop-blur-md sm:px-8 dark:border-cyan-400/10 dark:bg-slate-950/80">
      <Link href="/" className="font-bold text-gradient-aqua text-xl tracking-tight">
        SwimCoach
      </Link>
      <HeaderNav isLoggedIn={isLoggedIn} />
    </header>
  );
}
