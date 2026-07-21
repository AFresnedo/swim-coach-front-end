import type { SwimTimesResults } from "@/app/swim-log/_hooks/use-swim-times-query";
import { cardClass, secondaryButtonClass } from "@/lib/form-styles";
import { COURSE_LABELS, formatMmSs, STROKE_LABELS, type SwimTime } from "@/lib/swim-times-data";

function SwimTimeRow({ swimTime }: { swimTime: SwimTime }) {
  return (
    <tr className="border-slate-50 border-b last:border-0 dark:border-slate-800/50">
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
        {STROKE_LABELS[swimTime.stroke]}
      </td>
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
        {COURSE_LABELS[swimTime.course]}
      </td>
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">{swimTime.length}</td>
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">{swimTime.attempt_number}</td>
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
        {formatMmSs(swimTime.time_seconds)}
      </td>
      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
        {swimTime.is_official ? "Yes" : "No"}
      </td>
      <td className="py-2 text-slate-500 dark:text-slate-400">{swimTime.notes ?? ""}</td>
    </tr>
  );
}

export default function SwimTimesTable({
  results,
  hasActiveFilters,
}: {
  results: SwimTimesResults;
  hasActiveFilters: boolean;
}) {
  return (
    <>
      {results.error && (
        <p role="alert" className="text-red-600 text-sm dark:text-red-400">
          {results.error}
        </p>
      )}

      {results.loading && results.times.length === 0 && !results.error && (
        <p className="text-slate-500 text-sm dark:text-slate-400">Loading times…</p>
      )}

      {!results.loading && results.times.length === 0 && !results.error && (
        <p className="text-slate-500 text-sm dark:text-slate-400">
          {hasActiveFilters
            ? "No times match these filters for this date."
            : "No times logged for this date yet — add one above."}
        </p>
      )}

      {results.times.length > 0 && (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-slate-100 border-b text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4 font-medium">Stroke</th>
                <th className="py-2 pr-4 font-medium">Course</th>
                <th className="py-2 pr-4 font-medium">Length</th>
                <th className="py-2 pr-4 font-medium">Attempt</th>
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Official</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {results.times.map((t) => (
                <SwimTimeRow key={t.id} swimTime={t} />
              ))}
            </tbody>
          </table>

          {results.nextCursor && (
            <button
              type="button"
              onClick={results.handleLoadMore}
              disabled={results.loadingMore}
              className={`${secondaryButtonClass} mt-4`}
            >
              {results.loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
