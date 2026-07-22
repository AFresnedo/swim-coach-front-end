import type { Metadata } from "next";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "Disclaimer — SwimCoach",
};

export default async function DisclaimerPage() {
  "use cache";
  cacheLife("max");

  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          Disclaimer
        </h1>
        <div className="flex flex-col gap-4 text-slate-600 leading-relaxed dark:text-slate-400">
          <p>
            SwimCoach provides training suggestions, drills, and other swimming-related content for
            general informational purposes only. None of this content has been reviewed, vetted, or
            endorsed by a licensed swim coach, physical therapist, athletic trainer, or medical
            professional.
          </p>
          <p>
            Swimming and related physical training carry a risk of injury. Before following any
            advice, drill, or training plan from this site, you should independently verify it
            against a trusted, qualified source and consult a professional as appropriate for your
            situation.
          </p>
          <p>You use this site&apos;s content entirely at your own risk.</p>
        </div>
      </div>
    </div>
  );
}
