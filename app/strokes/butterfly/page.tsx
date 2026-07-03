const drills = [
  {
    name: "Single-Arm Butterfly",
    focus: "Pull mechanics",
    desc: "Swim butterfly using one arm at a time while the other rests extended at the front. Lets you focus on the catch, pull, and push of each arm independently.",
  },
  {
    name: "Two-Kick Focus",
    focus: "Kick timing",
    desc: "Exaggerate the two dolphin kicks per stroke cycle — one as the hands enter, one as they exit. Builds awareness of how kick timing drives the stroke.",
  },
  {
    name: "Dolphin Kick on Side",
    focus: "Underwater kick",
    desc: "Kick butterfly on your side with one arm extended. Isolates the dolphin kick and lets you feel the undulation from hips to feet.",
  },
  {
    name: "Catch Drill",
    focus: "High-elbow catch",
    desc: "At the front of each stroke, pause in the catch position with elbows high and hands angled down before pulling through. Builds feel for the early vertical forearm.",
  },
  {
    name: "Fly-Back",
    focus: "Arm timing",
    desc: "Swim butterfly arms with a backstroke kick instead of dolphin kick. Removes the most tiring element so you can focus entirely on arm timing and entry.",
  },
  {
    name: "Underwater Butterfly",
    focus: "Streamline & power",
    desc: "Push off the wall and perform full butterfly underwater with no breathing. Trains the undulating rhythm and is the foundation for powerful underwater phases.",
  },
];

export default function ButterflyPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <a
          href="/strokes"
          className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline mb-8 inline-block"
        >
          ← All strokes
        </a>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
            🦋 Butterfly
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Butterfly is the most physically demanding stroke. The key is not raw power but rhythm —
            an undulating body wave, precise kick timing, and a relaxed recovery make butterfly
            sustainable and fast. These drills break the stroke into manageable pieces.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-6">Drills</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drills.map(({ name, focus, desc }) => (
            <div key={name} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <span className="inline-block rounded-full bg-cyan-50 dark:bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-400 mb-3">
                {focus}
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
