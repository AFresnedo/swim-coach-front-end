import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import UserNav from "@/components/UserNav";

export default async function Header() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(AUTH_COOKIE);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
      <a href="/" className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
        SwimCoach
      </a>
      <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        <a href="/#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Features
        </a>
        <a href="/#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          How it works
        </a>
        <UserNav isLoggedIn={isLoggedIn} />
      </nav>
    </header>
  );
}
