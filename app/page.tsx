import Link from "next/link";
import { Suspense } from "react";
import FeatureCard from "@/app/_components/FeatureCard";
import HowItWorksStep from "@/app/_components/HowItWorksStep";
import { Stat, SwimCountStat, SwimmerCountStat } from "@/app/_components/Stat";
import { FEATURES, HOW_IT_WORKS_STEPS } from "@/app/_data/home-data";
import { strokes } from "@/shared/strokes-data";

const drillCount = strokes.reduce((total, stroke) => total + stroke.drills.length, 0);

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-sky-200 via-cyan-200 to-teal-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-500/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/10"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-24 pb-28 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-4 py-1 font-medium text-indigo-700 text-sm dark:bg-indigo-400/10 dark:text-indigo-300">
            ☀️ Built for swimmers, by swimmers
          </span>
          <h1 className="mb-6 font-bold text-5xl text-slate-900 leading-tight tracking-tight dark:text-slate-50">
            Cut seconds off your lap time.
            <br />
            <span className="text-gradient-aqua">Build the fitness to go further.</span>
          </h1>
          <p className="mb-10 max-w-2xl text-slate-600 text-xl leading-relaxed dark:text-slate-400">
            Log every swim, chase your goals, and dial in your technique.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              id="get-started"
              href="/sign-up"
              className="rounded-full bg-gradient-aqua px-8 py-3.5 font-semibold text-base text-white shadow-aqua transition-[filter] hover:brightness-110"
            >
              Start training free
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-slate-200 bg-white/60 px-8 py-3.5 font-semibold text-base text-slate-700 backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              See how it works
            </Link>
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
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 px-6 text-center text-white">
          <Suspense fallback={<Stat value="Fetching..." label="Swimmers training" />}>
            <SwimmerCountStat />
          </Suspense>
          <Suspense fallback={<Stat value="Fetching..." label="Swims logged" />}>
            <SwimCountStat />
          </Suspense>
          <Stat value={String(drillCount)} label="Drills & resources" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-5xl px-6 py-24">
        <h2 className="mb-4 text-center font-bold text-3xl text-slate-900 dark:text-slate-50">
          Everything you need to swim faster
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Track your training today, with AI-powered coaching features on the way.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center font-bold text-3xl text-slate-900 dark:text-slate-50">
            How it works
          </h2>
          <ol className="grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <HowItWorksStep key={item.step} {...item} />
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative flex flex-col items-center overflow-hidden px-6 py-24 text-center">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50/60 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950"
        />
        <div className="relative">
          <h2 className="mb-4 font-bold text-3xl text-slate-900 dark:text-slate-50">
            Ready to dive in?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-slate-600 dark:text-slate-400">
            Log your swims, chase your goals, and get faster in the water.
          </p>
          <Link
            href="/sign-up"
            className="rounded-full bg-gradient-aqua px-10 py-4 font-semibold text-base text-white shadow-aqua transition-[filter] hover:brightness-110"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto flex items-center justify-between border-slate-100 border-t px-8 py-8 text-slate-400 text-sm dark:border-slate-800">
        <span>© {new Date().getFullYear()} SwimCoach</span>
        <span>Better, one lap at a time</span>
      </footer>
    </div>
  );
}
