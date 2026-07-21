import SwimLog from "@/app/swim-log/_components/SwimLog";

export default function SwimLogPage() {
  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          Swim Log
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Log every swim and browse your times by date.
        </p>
        <SwimLog />
      </div>
    </div>
  );
}
