"use client";

import {
  COURSE_OPTIONS,
  type Course,
  STROKE_OPTIONS,
  type Stroke,
} from "@/app/swim-log/_data/swim-times";
import {
  type CreateSwimTimeFieldName,
  type CreateSwimTimeFormParams,
  useCreateSwimTimeForm,
} from "@/app/swim-log/_hooks/use-create-swim-time-form";
import Field from "@/components/Field";
import {
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
} from "@/shared/form-styles";

function getFieldError(
  errors: Record<string, string>,
  field: CreateSwimTimeFieldName,
): string | undefined {
  return errors[field];
}

function StrokeField({
  value,
  onChange,
  errors,
}: {
  value: Stroke;
  onChange: (value: Stroke) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "stroke");
  return (
    <Field htmlFor="log-stroke" label="Stroke" error={error}>
      <select
        id="log-stroke"
        value={value}
        onChange={(e) => onChange(e.target.value as Stroke)}
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        aria-describedby={error ? "log-stroke-error" : undefined}
      >
        {STROKE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CourseField({
  value,
  onChange,
  errors,
}: {
  value: Course;
  onChange: (value: Course) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "course");
  return (
    <Field htmlFor="log-course" label="Course" error={error}>
      <select
        id="log-course"
        value={value}
        onChange={(e) => onChange(e.target.value as Course)}
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        aria-describedby={error ? "log-course-error" : undefined}
      >
        {COURSE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function LengthField({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (value: string) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "length");
  return (
    <Field htmlFor="log-length" label="Length" error={error}>
      <input
        id="log-length"
        type="number"
        min={1}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="50"
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        aria-describedby={error ? "log-length-error" : undefined}
      />
    </Field>
  );
}

function TimeField({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (value: string) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "time_seconds");
  return (
    <Field htmlFor="log-time" label="Time" error={error}>
      <input
        id="log-time"
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1:02.35"
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        aria-describedby={error ? "log-time-error" : undefined}
      />
    </Field>
  );
}

function AttemptField({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (value: string) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "attempt_number");
  return (
    <Field htmlFor="log-attempt" label="Attempt #" error={error}>
      <input
        id="log-attempt"
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        aria-describedby={error ? "log-attempt-error" : undefined}
      />
    </Field>
  );
}

function NotesField({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (value: string) => void;
  errors: Record<string, string>;
}) {
  const error = getFieldError(errors, "notes");
  return (
    <Field htmlFor="log-notes" label="Notes" error={error}>
      <textarea
        id="log-notes"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${error ? inputErrorClass : inputNormalClass}`}
        placeholder="Optional"
        aria-describedby={error ? "log-notes-error" : undefined}
      />
    </Field>
  );
}

export default function CreateSwimTimeForm(props: CreateSwimTimeFormParams) {
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
  } = useCreateSwimTimeForm(props);

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StrokeField value={stroke} onChange={setStroke} errors={createFieldErrors} />
        <CourseField value={course} onChange={setCourse} errors={createFieldErrors} />
        <LengthField value={length} onChange={setLength} errors={createFieldErrors} />
        <TimeField value={timeText} onChange={setTimeText} errors={createFieldErrors} />
        <AttemptField
          value={attemptNumber}
          onChange={setAttemptNumber}
          errors={createFieldErrors}
        />

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

      <NotesField value={notes} onChange={setNotes} errors={createFieldErrors} />

      {createError && (
        <p role="alert" className="text-red-600 text-sm dark:text-red-400">
          {createError}
        </p>
      )}

      <button type="submit" disabled={creating} className={`${primaryButtonClass} self-start`}>
        {creating ? "Logging…" : "Log time"}
      </button>
    </form>
  );
}
