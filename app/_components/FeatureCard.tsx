import type { Feature } from "@/app/_content/home-data";

export default function FeatureCard({ icon, title, desc, comingSoon }: Feature) {
  return (
    <div className="group rounded-2xl border border-slate-300 p-6 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/10 hover:shadow-lg dark:border-slate-800">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-aqua text-2xl shadow-aqua">
          {icon}
        </span>
        {comingSoon && (
          <span className="mt-1 rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700 text-xs dark:bg-indigo-400/10 dark:text-indigo-300">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-lg text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm leading-relaxed dark:text-slate-400">{desc}</p>
    </div>
  );
}
