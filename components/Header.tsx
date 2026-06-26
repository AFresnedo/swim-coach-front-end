export default function Header() {
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
        <a href="/sign-in" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Sign in
        </a>
        <a
          href="/sign-up"
          className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          Get started
        </a>
      </nav>
    </header>
  );
}
