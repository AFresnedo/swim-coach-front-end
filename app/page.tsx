import { Suspense } from "react";
import { API_URL, safeFetch } from "@/lib/back-api";

export async function getUserCount(): Promise<number | null> {
  try {
    const res = await safeFetch("users-count", `${API_URL}/users/count`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user_count;
  } catch {
    return null;
  }
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-cyan-50 text-sm">{label}</p>
    </div>
  );
}

async function SwimmerCountStat() {
  const count = await getUserCount();
  return (
    <Stat
      value={count !== null ? count.toLocaleString() : "Fetching..."}
      label="Swimmers training"
    />
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan-300/40 dark:bg-cyan-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/10 blur-3xl"
        />
        <div className="relative flex flex-col items-center text-center px-6 pt-24 pb-28 max-w-4xl mx-auto w-full">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-400/10 px-4 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
            ☀️ Built for swimmers, by swimmers
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight mb-6">
            Cut seconds off your lap time.
            <br />
            <span className="text-gradient-aqua">Build the fitness to go further.</span>
          </h1>
          <p className="max-w-2xl text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
            SwimCoach gives you personalized training plans, lap-time tracking, and performance
            insights — so every session in the water counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              id="get-started"
              href="/sign-up"
              className="rounded-full bg-gradient-aqua px-8 py-3.5 text-base font-semibold text-white shadow-aqua hover:brightness-110 transition-[filter]"
            >
              Start training free
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
        <svg
          aria-hidden
          role="presentation"
          viewBox="0 0 1440 80"
          className="relative block w-full text-white dark:text-slate-950"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,32 C240,80 480,0 720,24 C960,48 1200,80 1440,32 L1440,80 L0,80 Z"
          />
        </svg>
      </section>

      {/* Stats */}
      <section className="bg-gradient-aqua py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          <Suspense fallback={<Stat value="Fetching..." label="Swimmers training" />}>
            <SwimmerCountStat />
          </Suspense>
          {[
            { value: "2.4s", label: "Avg. lap-time improvement" },
            { value: "500+", label: "Workouts in the library" },
          ].map(({ value, label }) => (
            <Stat key={label} value={value} label={label} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-50 mb-4">
          Everything you need to swim faster
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-xl mx-auto">
          SwimCoach combines smart analytics with proven training science to help you reach peak
          performance.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "⏱",
              title: "Lap-time tracking",
              desc: "Log every set and split. Visualize your progress over days, weeks, and months.",
            },
            {
              icon: "📋",
              title: "Personalized plans",
              desc: "Training plans tailored to your stroke, distance, and current fitness level.",
            },
            {
              icon: "📈",
              title: "Performance analytics",
              desc: "Understand pace trends, stroke efficiency, and where you're leaving time on the table.",
            },
            {
              icon: "🏊",
              title: "Stroke-specific drills",
              desc: "A full library of drills for freestyle, backstroke, breaststroke, and butterfly.",
            },
            {
              icon: "🔔",
              title: "Rest & recovery guidance",
              desc: "Know when to push and when to rest with load-management recommendations.",
            },
            {
              icon: "🏅",
              title: "Goal setting",
              desc: "Set a target time, pick your race date, and let SwimCoach build the roadmap.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-aqua text-2xl shadow-aqua">
                {icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-50 mb-16">
            How it works
          </h2>
          <ol className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Tell us about yourself",
                desc: "Share your current fitness level, preferred strokes, and performance goals.",
              },
              {
                step: "2",
                title: "Get your plan",
                desc: "Receive a week-by-week training schedule designed to hit your target time.",
              },
              {
                step: "3",
                title: "Track & improve",
                desc: "Log each session, review your analytics, and watch your lap times drop.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-aqua text-white text-xl font-bold mb-4 shadow-aqua">
                  {step}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 px-6 flex flex-col items-center text-center">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50/60 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Ready to dive in?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Join thousands of swimmers already hitting new personal bests with SwimCoach.
          </p>
          <a
            href="/sign-up"
            className="rounded-full bg-gradient-aqua px-10 py-4 text-base font-semibold text-white shadow-aqua hover:brightness-110 transition-[filter]"
          >
            Create your free account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 dark:border-slate-800 py-8 px-8 flex items-center justify-between text-sm text-slate-400">
        <span>© {new Date().getFullYear()} SwimCoach</span>
        <span>Built for the water</span>
      </footer>
    </div>
  );
}
