import Field from "@/components/Field";
import type {
  OfficialFilter,
  SwimTimesFilters,
} from "@/features/swim-log/hooks/use-swim-times-query";
import {
  cardClass,
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/form-styles";
import { COURSE_OPTIONS, type Course, STROKE_OPTIONS, type Stroke } from "@/lib/swim-times-data";

export default function DateAndFilterControls({
  selectedDate,
  setSelectedDate,
  filters,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  filters: SwimTimesFilters;
}) {
  const {
    filterStroke,
    setFilterStroke,
    filterCourse,
    setFilterCourse,
    filterLength,
    setFilterLength,
    filterLengthError,
    filterOfficial,
    setFilterOfficial,
  } = filters;

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
