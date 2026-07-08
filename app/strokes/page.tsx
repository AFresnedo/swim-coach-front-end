import Link from "next/link";
import { strokes } from "@/lib/strokes-data";

export default function StrokesPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Strokes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl">
          Drills, technique tips, and training resources for all four competitive strokes. Choose a
          stroke to get started.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {strokes.map(({ slug, icon, name, desc }) => (
            <Link
              key={slug}
              href={`/strokes/${slug}`}
              className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 transition-all"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-aqua text-3xl shadow-aqua">
                {icon}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {name}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-cyan-600 dark:text-cyan-400">
                View drills →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
