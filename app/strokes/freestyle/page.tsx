import DrillsSection from "@/components/DrillsSection";
import { checkLoggedIn } from "@/lib/auth";

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

export default async function FreestylePage() {
  const isLoggedIn = await checkLoggedIn();

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
            🏊 Freestyle
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Freestyle is the fastest and most versatile stroke. Improving your catch, body rotation,
            and kick efficiency will pay dividends in every race distance, from the 50m sprint to
            open-water events.
          </p>
        </div>

        <DrillsSection drills={drills} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
