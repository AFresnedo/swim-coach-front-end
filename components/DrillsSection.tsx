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
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">Drills</h2>
      {isLoggedIn ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drills.map(({ name, focus, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
            >
              <span className="inline-block rounded-full bg-cyan-50 dark:bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-400 mb-3">
                {focus}
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-10 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Sign in to see the full drill breakdown for this stroke.
          </p>
          <a
            href="/sign-in"
            className="inline-block rounded-full bg-gradient-aqua px-5 py-2 text-sm font-medium text-white shadow-aqua hover:brightness-110 transition-[filter]"
          >
            Sign in
          </a>
        </div>
      )}
    </>
  );
}
