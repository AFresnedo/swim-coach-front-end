import { cacheLife } from "next/cache";
import SwimLog from "@/app/swim-log/_components/SwimLog";
import { DynamicHole } from "@/components/DynamicHole";

export default async function SwimLogPage() {
  "use cache";
  cacheLife("max");

  return (
    <div className="min-h-full bg-page-gradient px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 font-bold text-4xl text-slate-900 tracking-tight dark:text-slate-50">
          Swim Log
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Log every swim and browse your times by date.
        </p>
        {/* SwimLog defaults its date picker to new Date() ("today") on
            mount — with this page's shell cached via cacheLife("max"),
            baking that into the shell would freeze "today" at whatever
            moment the cache was built. DynamicHole keeps it out of the
            shell so it's computed fresh on every real request instead. */}
        <DynamicHole>
          <SwimLog />
        </DynamicHole>
      </div>
    </div>
  );
}
