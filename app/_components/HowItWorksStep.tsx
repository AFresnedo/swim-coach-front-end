import type { Step } from "@/lib/home-data";

export default function HowItWorksStep({ step, title, desc, comingSoon }: Step) {
  return (
    <li className="flex flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-aqua text-white text-xl font-bold mb-4 shadow-aqua">
        {step}
      </span>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
        {title}
        {comingSoon && (
          <span className="rounded-full bg-indigo-100 dark:bg-indigo-400/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Coming soon
          </span>
        )}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </li>
  );
}
