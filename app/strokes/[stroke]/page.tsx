import Link from "next/link";
import { notFound } from "next/navigation";
import DrillsSection from "@/app/strokes/[stroke]/_components/DrillsSection";
import { DynamicHole } from "@/components/DynamicHole";
import { checkLoggedIn } from "@/shared/auth";
import { getStroke, strokes } from "@/shared/content/strokes";

export function generateStaticParams() {
  return strokes.map(({ slug }) => ({ stroke: slug }));
}

// A standalone function so StrokePage below has something to wrap in a
// Suspense boundary (required by cacheComponents for checkLoggedIn's cookie
// read) without also wrapping the stroke content, which doesn't depend on it.
export async function GatedDrills({ slug }: { slug: string }) {
  const stroke = getStroke(slug);
  if (!stroke) notFound();

  const isLoggedIn = await checkLoggedIn();
  return <DrillsSection drills={stroke.drills} isLoggedIn={isLoggedIn} />;
}

export default async function StrokePage({ params }: PageProps<"/strokes/[stroke]">) {
  const { stroke: slug } = await params;
  const stroke = getStroke(slug);
  if (!stroke) notFound();

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

        {/* No fallback: checkLoggedIn is a local cookie read with no network
            call, so the gap is expected to be near instant — and a
            placeholder couldn't reserve the right amount of space anyway
            without already knowing whether the real content is the drills
            grid or the shorter sign-in prompt. */}
        <DynamicHole>
          <GatedDrills slug={slug} />
        </DynamicHole>
      </div>
    </div>
  );
}
