import SwimLog from "@/features/swim-log/components/SwimLog";

export default function SwimLogPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Swim Log
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl">
          Log every swim and browse your times by date.
        </p>
        <SwimLog />
      </div>
    </div>
  );
}
