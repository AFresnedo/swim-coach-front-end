import GoalsList from "@/components/GoalsList";

export default function GoalsPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Your goals
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl">
          Set training goals, track progress, and retire them once they're reached.
        </p>
        <GoalsList />
      </div>
    </div>
  );
}
