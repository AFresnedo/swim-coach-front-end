import Field from "@/components/Field";
import type { useCreateSwimTimeForm } from "@/features/swim-log/hooks/use-create-swim-time-form";
import {
  cardClass,
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
} from "@/lib/form-styles";
import { COURSE_OPTIONS, type Course, STROKE_OPTIONS, type Stroke } from "@/lib/swim-times-data";

export default function CreateSwimTimeForm({
  form,
}: {
  form: ReturnType<typeof useCreateSwimTimeForm>;
}) {
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
  } = form;

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
