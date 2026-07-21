import GoalsList from "@/components/GoalsList";

export default function GoalsPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-3 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          Your goals
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Set training goals, track progress, and retire them once they're reached.
        </p>
        <GoalsList />
      </div>
    </div>
  );
}
