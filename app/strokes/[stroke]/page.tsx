import Link from "next/link";
import { notFound } from "next/navigation";
import DrillsSection from "@/app/strokes/[stroke]/_components/DrillsSection";
import { checkLoggedIn } from "@/shared/auth";
import { getStroke, strokes } from "@/shared/strokes-data";

export function generateStaticParams() {
  return strokes.map(({ slug }) => ({ stroke: slug }));
}

export default async function StrokePage({ params }: PageProps<"/strokes/[stroke]">) {
  const { stroke: slug } = await params;
  const stroke = getStroke(slug);
  if (!stroke) notFound();

  const isLoggedIn = await checkLoggedIn();

  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/strokes"
          className="mb-8 inline-block font-medium text-cyan-600 text-sm hover:underline dark:text-cyan-400"
        >
          ← All strokes
        </Link>

        <div className="mb-12">
          <h1 className="mb-3 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
            {stroke.icon} {stroke.name}
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-relaxed dark:text-slate-400">
            {stroke.description}
          </p>
        </div>

        <DrillsSection drills={stroke.drills} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
