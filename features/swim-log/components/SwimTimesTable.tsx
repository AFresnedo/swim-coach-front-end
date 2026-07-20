import type { OfficialFilter } from "@/features/swim-log/hooks/use-swim-times-query";
import { cardClass, secondaryButtonClass } from "@/lib/form-styles";
import {
  COURSE_LABELS,
  type Course,
  formatMmSs,
  STROKE_LABELS,
  type Stroke,
  type SwimTime,
} from "@/lib/swim-times-data";

function SwimTimeRow({ swimTime }: { swimTime: SwimTime }) {
  return (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
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
  times,
  loading,
  error,
  filterStroke,
  filterCourse,
  filterLength,
  filterOfficial,
  nextCursor,
  loadingMore,
  handleLoadMore,
}: {
  times: SwimTime[];
  loading: boolean;
  error: string;
  filterStroke: Stroke | "";
  filterCourse: Course | "";
  filterLength: string;
  filterOfficial: OfficialFilter;
  nextCursor: string | null;
  loadingMore: boolean;
  handleLoadMore: () => void;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading && times.length === 0 && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading times…</p>
      )}

      {!loading && times.length === 0 && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filterStroke || filterCourse || filterLength.trim() !== "" || filterOfficial
            ? "No times match these filters for this date."
            : "No times logged for this date yet — add one above."}
        </p>
      )}

      {times.length > 0 && (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
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
              {times.map((t) => (
                <SwimTimeRow key={t.id} swimTime={t} />
              ))}
            </tbody>
          </table>

          {nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`${secondaryButtonClass} mt-4`}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
