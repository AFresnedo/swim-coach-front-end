import Link from "next/link";
import { strokes } from "@/shared/strokes-data";

export default function StrokesPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          Strokes
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Drills, technique tips, and training resources for all four competitive strokes. Choose a
          stroke to get started.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {strokes.map(({ slug, icon, name, desc }) => (
            <Link
              key={slug}
              href={`/strokes/${slug}`}
              className="group rounded-2xl border border-slate-100 bg-white p-8 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/10 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-aqua text-3xl shadow-aqua">
                {icon}
              </span>
              <h2 className="mt-4 font-semibold text-slate-900 text-xl transition-colors group-hover:text-cyan-600 dark:text-slate-50 dark:group-hover:text-cyan-400">
                {name}
              </h2>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed dark:text-slate-400">
                {desc}
              </p>
              <span className="mt-4 inline-block font-medium text-cyan-600 text-sm dark:text-cyan-400">
                View drills →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
