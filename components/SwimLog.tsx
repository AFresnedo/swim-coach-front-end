"use client";

import { useEffect, useState } from "react";
import { inputClass, inputNormalClass, labelClass } from "@/lib/form-styles";
import { ApiError, frontApiFetch } from "@/lib/front-api";
import {
  COURSE_LABELS,
  COURSE_OPTIONS,
  type Course,
  formatMmSs,
  parseMmSs,
  STROKE_LABELS,
  STROKE_OPTIONS,
  type Stroke,
  SWIM_TIME_FILTER_PARAMS,
  type SwimTime,
  type SwimTimeFilterParam,
} from "@/lib/swim-times-data";

const cardClass =
  "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6";
const primaryButtonClass =
  "rounded-full bg-gradient-aqua px-4 py-2 text-sm font-semibold text-white shadow-aqua hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-[filter]";
const secondaryButtonClass =
  "rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors";

type OfficialFilter = "" | "true" | "false";

function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSwimTimesQuery(params: {
  date: string;
  filterStroke: Stroke | "";
  filterCourse: Course | "";
  filterLength: string;
  filterOfficial: OfficialFilter;
  cursor?: string;
}): string {
  const values: Partial<Record<SwimTimeFilterParam, string>> = {
    date_from: params.date,
    date_to: params.date,
    stroke: params.filterStroke || undefined,
    course: params.filterCourse || undefined,
    length: params.filterLength.trim() || undefined,
    is_official: params.filterOfficial || undefined,
    cursor: params.cursor,
  };

  const query = new URLSearchParams();
  for (const key of SWIM_TIME_FILTER_PARAMS) {
    const value = values[key];
    if (value) query.set(key, value);
  }
  return query.toString();
}

export default function SwimLog() {
  const [selectedDate, setSelectedDate] = useState(todayLocalDate);
  const [times, setTimes] = useState<SwimTime[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [filterStroke, setFilterStroke] = useState<Stroke | "">("");
  const [filterCourse, setFilterCourse] = useState<Course | "">("");
  const [filterLength, setFilterLength] = useState("");
  const [filterOfficial, setFilterOfficial] = useState<OfficialFilter>("");

  const [stroke, setStroke] = useState<Stroke>("freestyle");
  const [course, setCourse] = useState<Course>("scy");
  const [length, setLength] = useState("");
  const [timeText, setTimeText] = useState("");
  const [attemptNumber, setAttemptNumber] = useState("1");
  const [notes, setNotes] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = buildSwimTimesQuery({
      date: selectedDate,
      filterStroke,
      filterCourse,
      filterLength,
      filterOfficial,
    });

    frontApiFetch<{ items: SwimTime[]; next_cursor: string | null }>(`/api/swim-times?${query}`)
      .then((data) => {
        if (cancelled) return;
        setTimes(data.items);
        setNextCursor(data.next_cursor);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load swim times. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, filterStroke, filterCourse, filterLength, filterOfficial]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError("");

    try {
      const query = buildSwimTimesQuery({
        date: selectedDate,
        filterStroke,
        filterCourse,
        filterLength,
        filterOfficial,
        cursor: nextCursor,
      });
      const data = await frontApiFetch<{ items: SwimTime[]; next_cursor: string | null }>(
        `/api/swim-times?${query}`,
      );
      setTimes((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load more swim times. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");

    const timeSeconds = parseMmSs(timeText);
    if (timeSeconds === null) {
      setCreateError('Enter a valid time, e.g. "1:02.35" or "32.10".');
      return;
    }

    setCreating(true);
    try {
      const created = await frontApiFetch<SwimTime>("/api/swim-times", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          stroke,
          course,
          length: Number(length),
          attempt_number: attemptNumber.trim() === "" ? 1 : Number(attemptNumber),
          time_seconds: timeSeconds,
          is_official: isOfficial,
          notes: notes.trim() === "" ? null : notes.trim(),
        }),
      });
      const matchesCurrentView =
        created.date === selectedDate &&
        (filterStroke === "" || created.stroke === filterStroke) &&
        (filterCourse === "" || created.course === filterCourse) &&
        (filterLength.trim() === "" || created.length === Number(filterLength)) &&
        (filterOfficial === "" || created.is_official === (filterOfficial === "true"));
      if (matchesCurrentView) {
        setTimes((prev) => [created, ...prev]);
      }
      setLength("");
      setTimeText("");
      setAttemptNumber("1");
      setNotes("");
      setIsOfficial(false);
    } catch (err) {
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to log time. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={`${cardClass} flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="log-date" className={labelClass}>
            Date
          </label>
          <input
            id="log-date"
            type="date"
            required
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`${inputClass} ${inputNormalClass} sm:w-auto`}
          />
        </div>
      </div>

      <div className={`${cardClass} flex flex-col gap-4`}>
        <h2 className={labelClass}>Filter results</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-stroke" className={labelClass}>
              Filter by stroke
            </label>
            <select
              id="filter-stroke"
              value={filterStroke}
              onChange={(e) => setFilterStroke(e.target.value as Stroke | "")}
              className={`${inputClass} ${inputNormalClass}`}
            >
              <option value="">All strokes</option>
              {STROKE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-course" className={labelClass}>
              Filter by course
            </label>
            <select
              id="filter-course"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value as Course | "")}
              className={`${inputClass} ${inputNormalClass}`}
            >
              <option value="">All courses</option>
              {COURSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-length" className={labelClass}>
              Filter by length
            </label>
            <input
              id="filter-length"
              type="number"
              min={1}
              value={filterLength}
              onChange={(e) => setFilterLength(e.target.value)}
              placeholder="Any"
              className={`${inputClass} ${inputNormalClass}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-official" className={labelClass}>
              Filter by official status
            </label>
            <select
              id="filter-official"
              value={filterOfficial}
              onChange={(e) => setFilterOfficial(e.target.value as OfficialFilter)}
              className={`${inputClass} ${inputNormalClass}`}
            >
              <option value="">All times</option>
              <option value="true">Official only</option>
              <option value="false">Practice only</option>
            </select>
          </div>
        </div>

        {(filterStroke || filterCourse || filterLength.trim() !== "" || filterOfficial) && (
          <button
            type="button"
            onClick={() => {
              setFilterStroke("");
              setFilterCourse("");
              setFilterLength("");
              setFilterOfficial("");
            }}
            className={`${secondaryButtonClass} self-start`}
          >
            Clear filters
          </button>
        )}
      </div>

      <form onSubmit={handleCreate} className={`${cardClass} flex flex-col gap-4`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="log-stroke" className={labelClass}>
              Stroke
            </label>
            <select
              id="log-stroke"
              value={stroke}
              onChange={(e) => setStroke(e.target.value as Stroke)}
              className={`${inputClass} ${inputNormalClass}`}
            >
              {STROKE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="log-course" className={labelClass}>
              Course
            </label>
            <select
              id="log-course"
              value={course}
              onChange={(e) => setCourse(e.target.value as Course)}
              className={`${inputClass} ${inputNormalClass}`}
            >
              {COURSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="log-length" className={labelClass}>
              Length
            </label>
            <input
              id="log-length"
              type="number"
              min={1}
              required
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="50"
              className={`${inputClass} ${inputNormalClass}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="log-time" className={labelClass}>
              Time
            </label>
            <input
              id="log-time"
              type="text"
              required
              value={timeText}
              onChange={(e) => setTimeText(e.target.value)}
              placeholder="1:02.35"
              className={`${inputClass} ${inputNormalClass}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="log-attempt" className={labelClass}>
              Attempt #
            </label>
            <input
              id="log-attempt"
              type="number"
              min={1}
              value={attemptNumber}
              onChange={(e) => setAttemptNumber(e.target.value)}
              className={`${inputClass} ${inputNormalClass}`}
            />
          </div>

          <div className="flex items-end gap-2 pb-2.5">
            <input
              id="log-official"
              type="checkbox"
              checked={isOfficial}
              onChange={(e) => setIsOfficial(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="log-official" className={labelClass}>
              Official time
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="log-notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="log-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} ${inputNormalClass}`}
            placeholder="Optional"
          />
        </div>

        {createError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {createError}
          </p>
        )}

        <button type="submit" disabled={creating} className={`${primaryButtonClass} self-start`}>
          {creating ? "Logging…" : "Log time"}
        </button>
      </form>

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
                <tr
                  key={t.id}
                  className="border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                >
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                    {STROKE_LABELS[t.stroke]}
                  </td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                    {COURSE_LABELS[t.course]}
                  </td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">{t.length}</td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                    {t.attempt_number}
                  </td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                    {formatMmSs(t.time_seconds)}
                  </td>
                  <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                    {t.is_official ? "Yes" : "No"}
                  </td>
                  <td className="py-2 text-slate-500 dark:text-slate-400">{t.notes ?? ""}</td>
                </tr>
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
    </div>
  );
}
