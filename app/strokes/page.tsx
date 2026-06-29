const strokes = [
  {
    slug: "freestyle",
    icon: "🏊",
    name: "Freestyle",
    desc: "The fastest stroke. Master high-elbow catch, body rotation, and efficient kick to cut seconds off every lap.",
  },
  {
    slug: "backstroke",
    icon: "🔄",
    name: "Backstroke",
    desc: "The only stroke swum on your back. Develop shoulder rotation, a steady kick, and a clean hand exit.",
  },
  {
    slug: "breaststroke",
    icon: "🐸",
    name: "Breaststroke",
    desc: "The most technical stroke. Nail the pull-breathe-kick-glide timing to find rhythm and reduce drag.",
  },
  {
    slug: "butterfly",
    icon: "🦋",
    name: "Butterfly",
    desc: "The most demanding stroke. Build a powerful dolphin kick, undulating body wave, and simultaneous arm pull.",
  },
];

export default function StrokesPage() {
  return (
    <div className="min-h-full bg-white dark:bg-zinc-950 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Strokes
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl">
          Drills, technique tips, and training resources for all four competitive
          strokes. Choose a stroke to get started.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {strokes.map(({ slug, icon, name, desc }) => (
            <a
              key={slug}
              href={`/strokes/${slug}`}
              className="group rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
            >
              <span className="text-4xl">{icon}</span>
              <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {desc}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400">
                View drills →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
