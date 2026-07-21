"use client";

import { useRef, useState } from "react";
import {
  type Course,
  type Stroke,
  SWIM_TIME_FILTER_PARAMS,
  type SwimTime,
  type SwimTimeFilterParam,
} from "@/app/swim-log/_data/swim-times";
import { useAbortableEffect } from "@/shared/use-abortable-effect";
import { useDebouncedValue } from "@/shared/use-debounced-value";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/use-protected-front-fetch";

export type OfficialFilter = "" | "true" | "false";

type SwimTimesPage = { items: SwimTime[]; next_cursor: string | null };

type SwimTimesQueryParams = {
  date: string;
  filterStroke: Stroke | "";
  filterCourse: Course | "";
  filterLength: string;
  filterOfficial: OfficialFilter;
  cursor?: string;
};

export type SwimTimesFilters = {
  filterStroke: Stroke | "";
  setFilterStroke: (value: Stroke | "") => void;
  filterCourse: Course | "";
  setFilterCourse: (value: Course | "") => void;
  filterLength: string;
  setFilterLength: (value: string) => void;
  filterLengthError: string | null;
  filterOfficial: OfficialFilter;
  setFilterOfficial: (value: OfficialFilter) => void;
  hasActiveFilters: boolean;
};

export type SwimTimesResults = {
  times: SwimTime[];
  nextCursor: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string;
  handleLoadMore: () => void;
};

function validateFilterLength(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  const isDigitsOnly = /^\d+$/.test(trimmed);
  const isPositive = Number(trimmed) > 0;
  if (!isDigitsOnly || !isPositive) {
    return "Length must be a positive whole number.";
  }
  return null;
}

function buildSwimTimesQuery(params: SwimTimesQueryParams): string {
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

export function useSwimTimesQuery(selectedDate: string) {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [times, setTimes] = useState<SwimTime[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [filterStroke, setFilterStroke] = useState<Stroke | "">("");
  const [filterCourse, setFilterCourse] = useState<Course | "">("");
  const [filterLength, setFilterLength] = useState("");
  const [filterOfficial, setFilterOfficial] = useState<OfficialFilter>("");

  const viewGenerationRef = useRef(0);
  const filterLengthError = validateFilterLength(filterLength);
  const hasActiveFilters = Boolean(
    filterStroke || filterCourse || filterLength.trim() !== "" || filterOfficial,
  );
  const debouncedFilterLength = useDebouncedValue(filterLength, 300);
  const debouncedFilterLengthError = validateFilterLength(debouncedFilterLength);

  useAbortableEffect(
    (signal) => {
      viewGenerationRef.current += 1;
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

      protectedFrontFetch<SwimTimesPage>(`/swim-log/api?${query}`, { signal })
        .then((data) => {
          if (signal.aborted) return;
          setTimes(data.items);
          setNextCursor(data.next_cursor);
        })
        .catch((err) => {
          if (signal.aborted) return;
          const message = protectedErrorMessage(
            err,
            "Failed to load swim times. Please try again.",
          );
          if (message) setError(message);
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    },
    [
      selectedDate,
      filterStroke,
      filterCourse,
      debouncedFilterLength,
      filterOfficial,
      debouncedFilterLengthError,
      protectedFrontFetch,
    ],
  );

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
      const data = await protectedFrontFetch<SwimTimesPage>(`/swim-log/api?${query}`);
      if (viewGenerationRef.current !== generation) return;
      setTimes((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } catch (err) {
      if (viewGenerationRef.current !== generation) return;
      const message = protectedErrorMessage(
        err,
        "Failed to load more swim times. Please try again.",
      );
      if (message) setError(message);
    } finally {
      if (viewGenerationRef.current === generation) setLoadingMore(false);
    }
  }

  function getViewGeneration() {
    return viewGenerationRef.current;
  }

  function insertIfCurrentView(created: SwimTime, generation: number) {
    // The create request may resolve after the user has already changed the
    // date or filters — reject it here so a stale response can't insert a
    // swim time into a view the user has since navigated away from.
    const requestIsStillCurrent = viewGenerationRef.current === generation;

    const matchesCurrentFilters =
      created.date === selectedDate &&
      (filterStroke === "" || created.stroke === filterStroke) &&
      (filterCourse === "" || created.course === filterCourse) &&
      (debouncedFilterLength.trim() === "" || created.length === Number(debouncedFilterLength)) &&
      (filterOfficial === "" || created.is_official === (filterOfficial === "true"));

    if (requestIsStillCurrent && matchesCurrentFilters) {
      setTimes((prev) => [created, ...prev]);
    }
  }

  return {
    results: {
      times,
      nextCursor,
      loading,
      loadingMore,
      error,
      handleLoadMore,
    },
    filters: {
      filterStroke,
      setFilterStroke,
      filterCourse,
      setFilterCourse,
      filterLength,
      setFilterLength,
      filterLengthError,
      filterOfficial,
      setFilterOfficial,
      hasActiveFilters,
    },
    getViewGeneration,
    insertIfCurrentView,
  };
}
