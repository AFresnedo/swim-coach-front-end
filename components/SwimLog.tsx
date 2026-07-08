"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  cardClass,
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/form-styles";
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
import { useDebouncedValue } from "@/lib/use-debounced-value";

type OfficialFilter = "" | "true" | "false";

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function validateFilterLength(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
    return "Length must be a positive whole number.";
  }
  return null;
}

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
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  const viewGenerationRef = useRef(0);
  const filterLengthError = validateFilterLength(filterLength);
  const debouncedFilterLength = useDebouncedValue(filterLength, 300);
  const debouncedFilterLengthError = validateFilterLength(debouncedFilterLength);

  useEffect(() => {
    viewGenerationRef.current += 1;
    let cancelled = false;
    setError("");

    if (debouncedFilterLengthError) {
      setLoading(false);
      setTimes([]);
      setNextCursor(null);
      return;
    }

    setLoading(true);

    const query = buildSwimTimesQuery({
      date: selectedDate,
      filterStroke,
      filterCourse,
      filterLength: debouncedFilterLength,
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
  }, [
    selectedDate,
    filterStroke,
    filterCourse,
    debouncedFilterLength,
    filterOfficial,
    debouncedFilterLengthError,
  ]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    const generation = viewGenerationRef.current;
    setLoadingMore(true);
    setError("");

    try {
      const query = buildSwimTimesQuery({
        date: selectedDate,
        filterStroke,
        filterCourse,
        filterLength: debouncedFilterLength,
        filterOfficial,
        cursor: nextCursor,
      });
      const data = await frontApiFetch<{ items: SwimTime[]; next_cursor: string | null }>(
        `/api/swim-times?${query}`,
      );
      if (viewGenerationRef.current !== generation) return;
      setTimes((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } catch (err) {
      if (viewGenerationRef.current !== generation) return;
      setError(
        err instanceof ApiError ? err.message : "Failed to load more swim times. Please try again.",
      );
    } finally {
      if (viewGenerationRef.current === generation) setLoadingMore(false);
    }
  }

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreateFieldErrors({});

    const timeSeconds = parseMmSs(timeText);
    if (timeSeconds === null) {
      setCreateError('Enter a valid time, e.g. "1:02.35" or "32.10".');
      return;
    }

    const generation = viewGenerationRef.current;
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
        viewGenerationRef.current === generation &&
        created.date === selectedDate &&
        (filterStroke === "" || created.stroke === filterStroke) &&
        (filterCourse === "" || created.course === filterCourse) &&
        (debouncedFilterLength.trim() === "" || created.length === Number(debouncedFilterLength)) &&
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
      if (err instanceof ApiError) {
        setCreateError(err.message);
        if (err.errors) setCreateFieldErrors(err.errors);
      } else {
        setCreateError("Failed to log time. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={`${cardClass} flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4`}>
        <Field htmlFor="log-date" label="Date">
          <input
            id="log-date"
            type="date"
            required
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`${inputClass} ${inputNormalClass} sm:w-auto`}
          />
        </Field>
      </div>

      <div className={`${cardClass} flex flex-col gap-4`}>
        <h2 className={labelClass}>Filter results</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field htmlFor="filter-stroke" label="Filter by stroke">
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
          </Field>

          <Field htmlFor="filter-course" label="Filter by course">
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
          </Field>

          <Field htmlFor="filter-length" label="Filter by length" error={filterLengthError}>
            <input
              id="filter-length"
              type="number"
              min={1}
              value={filterLength}
              onChange={(e) => setFilterLength(e.target.value)}
              placeholder="Any"
              className={`${inputClass} ${filterLengthError ? inputErrorClass : inputNormalClass}`}
              aria-describedby={filterLengthError ? "filter-length-error" : undefined}
            />
          </Field>

          <Field htmlFor="filter-official" label="Filter by official status">
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
          </Field>
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
          <Field htmlFor="log-stroke" label="Stroke" error={createFieldErrors.stroke}>
            <select
              id="log-stroke"
              value={stroke}
              onChange={(e) => setStroke(e.target.value as Stroke)}
              className={`${inputClass} ${createFieldErrors.stroke ? inputErrorClass : inputNormalClass}`}
              aria-describedby={createFieldErrors.stroke ? "log-stroke-error" : undefined}
            >
              {STROKE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field htmlFor="log-course" label="Course" error={createFieldErrors.course}>
            <select
              id="log-course"
              value={course}
              onChange={(e) => setCourse(e.target.value as Course)}
              className={`${inputClass} ${createFieldErrors.course ? inputErrorClass : inputNormalClass}`}
              aria-describedby={createFieldErrors.course ? "log-course-error" : undefined}
            >
              {COURSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field htmlFor="log-length" label="Length" error={createFieldErrors.length}>
            <input
              id="log-length"
              type="number"
              min={1}
              required
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="50"
              className={`${inputClass} ${createFieldErrors.length ? inputErrorClass : inputNormalClass}`}
              aria-describedby={createFieldErrors.length ? "log-length-error" : undefined}
            />
          </Field>

          <Field htmlFor="log-time" label="Time" error={createFieldErrors.time_seconds}>
            <input
              id="log-time"
              type="text"
              required
              value={timeText}
              onChange={(e) => setTimeText(e.target.value)}
              placeholder="1:02.35"
              className={`${inputClass} ${createFieldErrors.time_seconds ? inputErrorClass : inputNormalClass}`}
              aria-describedby={createFieldErrors.time_seconds ? "log-time-error" : undefined}
            />
          </Field>

          <Field htmlFor="log-attempt" label="Attempt #" error={createFieldErrors.attempt_number}>
            <input
              id="log-attempt"
              type="number"
              min={1}
              value={attemptNumber}
              onChange={(e) => setAttemptNumber(e.target.value)}
              className={`${inputClass} ${createFieldErrors.attempt_number ? inputErrorClass : inputNormalClass}`}
              aria-describedby={createFieldErrors.attempt_number ? "log-attempt-error" : undefined}
            />
          </Field>

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

        <Field htmlFor="log-notes" label="Notes" error={createFieldErrors.notes}>
          <textarea
            id="log-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} ${createFieldErrors.notes ? inputErrorClass : inputNormalClass}`}
            placeholder="Optional"
            aria-describedby={createFieldErrors.notes ? "log-notes-error" : undefined}
          />
        </Field>

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
