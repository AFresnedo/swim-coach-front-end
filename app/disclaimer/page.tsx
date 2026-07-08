import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — SwimCoach",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
          Disclaimer
        </h1>
        <div className="flex flex-col gap-4 text-slate-600 dark:text-slate-400 leading-relaxed">
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
