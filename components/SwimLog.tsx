"use client";

import { useState } from "react";
import Field from "@/components/Field";
import {
  cardClass,
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/form-styles";
import {
  COURSE_LABELS,
  COURSE_OPTIONS,
  type Course,
  formatMmSs,
  STROKE_LABELS,
  STROKE_OPTIONS,
  type Stroke,
  type SwimTime,
} from "@/lib/swim-times-data";
import { useCreateSwimTimeForm } from "@/lib/use-create-swim-time-form";
import { type OfficialFilter, useSwimTimesQuery } from "@/lib/use-swim-times-query";

function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DateAndFilterControls({
  selectedDate,
  setSelectedDate,
  filterStroke,
  setFilterStroke,
  filterCourse,
  setFilterCourse,
  filterLength,
  setFilterLength,
  filterLengthError,
  filterOfficial,
  setFilterOfficial,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  filterStroke: Stroke | "";
  setFilterStroke: (value: Stroke | "") => void;
  filterCourse: Course | "";
  setFilterCourse: (value: Course | "") => void;
  filterLength: string;
  setFilterLength: (value: string) => void;
  filterLengthError: string | null;
  filterOfficial: OfficialFilter;
  setFilterOfficial: (value: OfficialFilter) => void;
}) {
  return (
    <>
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
    </>
  );
}

function CreateSwimTimeForm({
  stroke,
  setStroke,
  course,
  setCourse,
  length,
  setLength,
  timeText,
  setTimeText,
  attemptNumber,
  setAttemptNumber,
  notes,
  setNotes,
  isOfficial,
  setIsOfficial,
  creating,
  createError,
  createFieldErrors,
  handleCreate,
}: {
  stroke: Stroke;
  setStroke: (value: Stroke) => void;
  course: Course;
  setCourse: (value: Course) => void;
  length: string;
  setLength: (value: string) => void;
  timeText: string;
  setTimeText: (value: string) => void;
  attemptNumber: string;
  setAttemptNumber: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  isOfficial: boolean;
  setIsOfficial: (value: boolean) => void;
  creating: boolean;
  createError: string;
  createFieldErrors: Record<string, string>;
  handleCreate: (e: React.SubmitEvent<HTMLFormElement>) => void;
}) {
  return (
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
  );
}

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

function SwimTimesTable({
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

export default function SwimLog() {
  const [selectedDate, setSelectedDate] = useState(todayLocalDate);

  const {
    times,
    nextCursor,
    loading,
    loadingMore,
    error,
    filterStroke,
    setFilterStroke,
    filterCourse,
    setFilterCourse,
    filterLength,
    setFilterLength,
    filterLengthError,
    filterOfficial,
    setFilterOfficial,
    handleLoadMore,
    getViewGeneration,
    addIfVisible,
  } = useSwimTimesQuery(selectedDate);

  const {
    stroke,
    setStroke,
    course,
    setCourse,
    length,
    setLength,
    timeText,
    setTimeText,
    attemptNumber,
    setAttemptNumber,
    notes,
    setNotes,
    isOfficial,
    setIsOfficial,
    creating,
    createError,
    createFieldErrors,
    handleCreate,
  } = useCreateSwimTimeForm({ selectedDate, getViewGeneration, addIfVisible });

  return (
    <div className="flex flex-col gap-8">
      <DateAndFilterControls
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filterStroke={filterStroke}
        setFilterStroke={setFilterStroke}
        filterCourse={filterCourse}
        setFilterCourse={setFilterCourse}
        filterLength={filterLength}
        setFilterLength={setFilterLength}
        filterLengthError={filterLengthError}
        filterOfficial={filterOfficial}
        setFilterOfficial={setFilterOfficial}
      />

      <CreateSwimTimeForm
        stroke={stroke}
        setStroke={setStroke}
        course={course}
        setCourse={setCourse}
        length={length}
        setLength={setLength}
        timeText={timeText}
        setTimeText={setTimeText}
        attemptNumber={attemptNumber}
        setAttemptNumber={setAttemptNumber}
        notes={notes}
        setNotes={setNotes}
        isOfficial={isOfficial}
        setIsOfficial={setIsOfficial}
        creating={creating}
        createError={createError}
        createFieldErrors={createFieldErrors}
        handleCreate={handleCreate}
      />

      <SwimTimesTable
        times={times}
        loading={loading}
        error={error}
        filterStroke={filterStroke}
        filterCourse={filterCourse}
        filterLength={filterLength}
        filterOfficial={filterOfficial}
        nextCursor={nextCursor}
        loadingMore={loadingMore}
        handleLoadMore={handleLoadMore}
      />
    </div>
  );
}
