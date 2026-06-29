const drills = [
  {
    name: "Catch-Up Drill",
    focus: "Timing & extension",
    desc: "Keep one arm fully extended at the front until the recovering arm catches up before beginning the next pull. Builds patient timing and full reach.",
  },
  {
    name: "Fingertip Drag",
    focus: "High-elbow recovery",
    desc: "During arm recovery, drag your fingertips lightly along the water surface. Forces a high elbow position and a relaxed, efficient recovery.",
  },
  {
    name: "Fist Drill",
    focus: "Forearm feel",
    desc: "Swim with closed fists. Removes hand surface area so you learn to press water with your forearm, improving your catch and pull.",
  },
  {
    name: "Side Kick",
    focus: "Body rotation",
    desc: "Kick on your side with the lower arm extended and the upper arm at your hip. Trains the rotated body position used throughout the stroke.",
  },
  {
    name: "Single-Arm Freestyle",
    focus: "Pull mechanics",
    desc: "Swim using one arm only while the other rests at your side or extended front. Lets you focus entirely on the pull path of each arm.",
  },
  {
    name: "Tarzan Drill",
    focus: "Balance & awareness",
    desc: "Swim freestyle with your head raised above the water, eyes looking forward. Develops body balance and feel for your waterline.",
  },
];

export default function FreestylePage() {
  return (
    <div className="min-h-full bg-white dark:bg-zinc-950 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <a
          href="/strokes"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block"
        >
          ← All strokes
        </a>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            🏊 Freestyle
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Freestyle is the fastest and most versatile stroke. Improving your
            catch, body rotation, and kick efficiency will pay dividends in every
            race distance, from the 50m sprint to open-water events.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          Drills
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drills.map(({ name, focus, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6"
            >
              <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">
                {focus}
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                {name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
