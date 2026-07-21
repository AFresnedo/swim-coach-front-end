import Link from "next/link";
import type { Drill } from "@/lib/strokes-data";

export default function DrillsSection({
  drills,
  isLoggedIn,
}: {
  drills: Drill[];
  isLoggedIn: boolean;
}) {
  return (
    <>
      <h2 className="mb-6 font-semibold text-2xl text-slate-900 dark:text-slate-50">Drills</h2>
      {isLoggedIn ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drills.map(({ name, focus, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="mb-3 inline-block rounded-full bg-cyan-50 px-3 py-0.5 font-medium text-cyan-700 text-xs dark:bg-cyan-500/10 dark:text-cyan-400">
                {focus}
              </span>
              <h3 className="mb-2 font-semibold text-base text-slate-900 dark:text-slate-50">
                {name}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            Sign in to see the full drill breakdown for this stroke.
          </p>
          <Link
            href="/sign-in"
            className="inline-block rounded-full bg-gradient-aqua px-5 py-2 font-medium text-sm text-white shadow-aqua transition-[filter] hover:brightness-110"
          >
            Sign in
          </Link>
        </div>
      )}
    </>
  );
}
