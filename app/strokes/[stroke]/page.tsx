import Link from "next/link";
import { notFound } from "next/navigation";
import DrillsSection from "@/components/DrillsSection";
import { checkLoggedIn } from "@/lib/auth";
import { getStroke, strokes } from "@/lib/strokes-data";

export function generateStaticParams() {
  return strokes.map(({ slug }) => ({ stroke: slug }));
}

export default async function StrokePage({ params }: PageProps<"/strokes/[stroke]">) {
  const { stroke: slug } = await params;
  const stroke = getStroke(slug);
  if (!stroke) notFound();

  const isLoggedIn = await checkLoggedIn();

  return (
    <div className="min-h-full bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/strokes"
          className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline mb-8 inline-block"
        >
          ← All strokes
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
            {stroke.icon} {stroke.name}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {stroke.description}
          </p>
        </div>

        <DrillsSection drills={stroke.drills} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
