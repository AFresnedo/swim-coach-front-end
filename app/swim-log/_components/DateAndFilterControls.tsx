import type { OfficialFilter, SwimTimesFilters } from "@/app/swim-log/_hooks/use-swim-times-query";
import {
  COURSE_OPTIONS,
  type Course,
  STROKE_OPTIONS,
  type Stroke,
} from "@/app/swim-log/_lib/swim-times-data";
import Field from "@/components/Field";
import {
  cardClass,
  inputClass,
  inputErrorClass,
  inputNormalClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/form-styles";

export default function DateAndFilterControls({
  selectedDate,
  setSelectedDate,
  filters,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  filters: SwimTimesFilters;
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
              value={filters.filterStroke}
              onChange={(e) => filters.setFilterStroke(e.target.value as Stroke | "")}
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
              value={filters.filterCourse}
              onChange={(e) => filters.setFilterCourse(e.target.value as Course | "")}
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

          <Field htmlFor="filter-length" label="Filter by length" error={filters.filterLengthError}>
            <input
              id="filter-length"
              type="number"
              min={1}
              value={filters.filterLength}
              onChange={(e) => filters.setFilterLength(e.target.value)}
              placeholder="Any"
              className={`${inputClass} ${filters.filterLengthError ? inputErrorClass : inputNormalClass}`}
              aria-describedby={filters.filterLengthError ? "filter-length-error" : undefined}
            />
          </Field>

          <Field htmlFor="filter-official" label="Filter by official status">
            <select
              id="filter-official"
              value={filters.filterOfficial}
              onChange={(e) => filters.setFilterOfficial(e.target.value as OfficialFilter)}
              className={`${inputClass} ${inputNormalClass}`}
            >
              <option value="">All times</option>
              <option value="true">Official only</option>
              <option value="false">Practice only</option>
            </select>
          </Field>
        </div>

        {filters.hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              filters.setFilterStroke("");
              filters.setFilterCourse("");
              filters.setFilterLength("");
              filters.setFilterOfficial("");
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
