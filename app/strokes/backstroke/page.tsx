import DrillsSection from "@/components/DrillsSection";
import { isLoggedIn } from "@/lib/auth";

const drills = [
  {
    name: "Single-Arm Backstroke",
    focus: "Pull mechanics",
    desc: "Swim with one arm pulling while the other rests at your side. Concentrate on a deep catch, straight pull path, and strong finish past the hip.",
  },
  {
    name: "Shoulder Roll Drill",
    focus: "Body rotation",
    desc: "Exaggerate shoulder rotation on every stroke, driving the pulling shoulder deep and the recovering shoulder high. Builds power and reduces drag.",
  },
  {
    name: "Backstroke Kick",
    focus: "Kick technique",
    desc: "Kick on your back with arms at your sides. Focus on keeping toes pointed, knees below the surface, and generating propulsion from the upkick.",
  },
  {
    name: "Thumb-Exit Drill",
    focus: "Hand exit",
    desc: "Consciously lead the hand out of the water with the thumb pointing up. Promotes a clean, lateral exit that sets up an efficient recovery.",
  },
  {
    name: "Fist Backstroke",
    focus: "Forearm catch",
    desc: "Swim backstroke with closed fists to remove hand surface area. Teaches you to engage your forearm during the catch for a stronger pull.",
  },
  {
    name: "Windmill Drill",
    focus: "Arm timing",
    desc: "Circle both arms continuously in a windmill motion out of the water before entering. Grooves the alternating rhythm and relaxed recovery path.",
  },
];

export default async function BackstrokePage() {
  const loggedIn = await isLoggedIn();

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
            🔄 Backstroke
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Backstroke is the only stroke swum on your back, which creates unique challenges for
            balance and orientation. Developing a steady kick, strong shoulder rotation, and a clean
            hand exit will make you significantly more efficient in the water.
          </p>
        </div>

        <DrillsSection drills={drills} isLoggedIn={loggedIn} />
      </div>
    </div>
  );
}
