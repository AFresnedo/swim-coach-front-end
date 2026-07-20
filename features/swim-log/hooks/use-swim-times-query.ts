"use client";

import { useEffect, useRef, useState } from "react";
import {
  type Course,
  type Stroke,
  SWIM_TIME_FILTER_PARAMS,
  type SwimTime,
  type SwimTimeFilterParam,
} from "@/lib/swim-times-data";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/lib/use-protected-front-fetch";

export type OfficialFilter = "" | "true" | "false";

function validateFilterLength(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
    return "Length must be a positive whole number.";
  }
  return null;
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

    protectedFrontFetch<{ items: SwimTime[]; next_cursor: string | null }>(
      `/api/swim-times?${query}`,
    )
      .then((data) => {
        if (cancelled) return;
        setTimes(data.items);
        setNextCursor(data.next_cursor);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = protectedErrorMessage(err, "Failed to load swim times. Please try again.");
        if (message) setError(message);
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
    protectedFrontFetch,
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
      const data = await protectedFrontFetch<{ items: SwimTime[]; next_cursor: string | null }>(
        `/api/swim-times?${query}`,
      );
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

  function addIfVisible(created: SwimTime, generation: number) {
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
  }

  return {
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
  };
}
