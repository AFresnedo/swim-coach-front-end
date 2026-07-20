export type Feature = {
  icon: string;
  title: string;
  desc: string;
  comingSoon?: boolean;
};

export const FEATURES: Feature[] = [
  {
    icon: "⏱",
    title: "Swim Log",
    desc: "Log every set and split, and browse your history by date and stroke.",
  },
  {
    icon: "🏅",
    title: "Goal setting",
    desc: "Set a goal, track it over time, and mark it reached once you get there.",
  },
  {
    icon: "🏊",
    title: "Stroke-specific drills",
    desc: "A full library of drills for freestyle, backstroke, breaststroke, and butterfly.",
  },
  {
    icon: "📋",
    title: "Personalized plans",
    desc: "AI-generated training plans tailored to your stroke, distance, and fitness level.",
    comingSoon: true,
  },
  {
    icon: "📈",
    title: "Performance analytics",
    desc: "ML-powered insights into pace trends, stroke efficiency, and where you're leaving time on the table.",
    comingSoon: true,
  },
  {
    icon: "🔔",
    title: "Rest & recovery guidance",
    desc: "AI recommendations for when to push and when to rest, based on your training load.",
    comingSoon: true,
  },
];

export type Step = {
  step: string;
  title: string;
  desc: string;
  comingSoon?: boolean;
};

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    step: "1",
    title: "Tell us about yourself",
    desc: "Set up your profile and tell us what you're working toward.",
  },
  {
    step: "2",
    title: "Get your plan",
    desc: "Soon, we'll turn your profile into a week-by-week training schedule built around your goals.",
    comingSoon: true,
  },
  {
    step: "3",
    title: "Track & improve",
    desc: "Log each session to build your history. Pace-trend analytics are coming soon.",
  },
];
