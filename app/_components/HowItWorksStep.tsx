import type { Step } from "@/lib/home-data";

export default function HowItWorksStep({ step, title, desc, comingSoon }: Step) {
  return (
    <li className="flex flex-col items-center text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-aqua font-bold text-white text-xl shadow-aqua">
        {step}
      </span>
      <h3 className="mb-2 flex items-center gap-2 font-semibold text-lg text-slate-900 dark:text-slate-50">
        {title}
        {comingSoon && (
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700 text-xs dark:bg-indigo-400/10 dark:text-indigo-300">
            Coming soon
          </span>
        )}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">{desc}</p>
    </li>
  );
}
