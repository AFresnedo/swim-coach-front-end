export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto w-full">
        <span className="mb-4 inline-block rounded-full bg-blue-50 dark:bg-blue-950 px-4 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
          Built for swimmers, by swimmers
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-6">
          Cut seconds off your lap time.
          <br />
          Build the fitness to go further.
        </h1>
        <p className="max-w-2xl text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">
          SwimCoach gives you personalized training plans, lap-time tracking, and performance
          insights — so every session in the water counts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            id="get-started"
            href="/sign-up"
            className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Start training free
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-200 dark:border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { value: "10,000+", label: "Swimmers training" },
            { value: "2.4s", label: "Avg. lap-time improvement" },
            { value: "500+", label: "Workouts in the library" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="mt-1 text-blue-100 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-4">
          Everything you need to swim faster
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-16 max-w-xl mx-auto">
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
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {title}
              </h3>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-zinc-50 dark:bg-zinc-900 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-16">
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
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold mb-4">
                  {step}
                </span>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  {title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Ready to dive in?
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
          Join thousands of swimmers already hitting new personal bests with SwimCoach.
        </p>
        <a
          href="/sign-up"
          className="rounded-full bg-blue-600 px-10 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Create your free account
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-100 dark:border-zinc-800 py-8 px-8 flex items-center justify-between text-sm text-zinc-400">
        <span>© {new Date().getFullYear()} SwimCoach</span>
        <span>Built for the water</span>
      </footer>
    </div>
  );
}
