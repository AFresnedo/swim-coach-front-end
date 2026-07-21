"use client";

import { useState } from "react";
import type { Course, Stroke, SwimTime } from "@/app/swim-log/_data/swim-times";
import { parseMmSs } from "@/app/swim-log/_utils/format-time";
import { apiErrorDetails } from "@/shared/front-api";
import { isAuthRedirect, useProtectedFrontFetch } from "@/shared/use-protected-front-fetch";

export type CreateSwimTimeFormParams = {
  selectedDate: string;
  getViewGeneration: () => number;
  insertIfCurrentView: (created: SwimTime, generation: number) => void;
};

export type CreateSwimTimeFieldName =
  | "stroke"
  | "course"
  | "length"
  | "time_seconds"
  | "attempt_number"
  | "notes";

const DEFAULT_ATTEMPT_NUMBER = "1";

export function useCreateSwimTimeForm({
  selectedDate,
  getViewGeneration,
  insertIfCurrentView,
}: CreateSwimTimeFormParams) {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [stroke, setStroke] = useState<Stroke>("freestyle");
  const [course, setCourse] = useState<Course>("scy");
  const [length, setLength] = useState("");
  const [timeText, setTimeText] = useState("");
  const [attemptNumber, setAttemptNumber] = useState(DEFAULT_ATTEMPT_NUMBER);
  const [notes, setNotes] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  function resetPerSwimFields() {
    // stroke and course aren't part of this reset — logging several swims
    // back-to-back usually means repeating the same stroke and course, so
    // leaving them selected saves re-picking them for every entry.
    setLength("");
    setTimeText("");
    setAttemptNumber(DEFAULT_ATTEMPT_NUMBER);
    setNotes("");
    setIsOfficial(false);
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

    const generation = getViewGeneration();
    setCreating(true);
    try {
      const created = await protectedFrontFetch<SwimTime>("/swim-log/api", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          stroke,
          course,
          length: Number(length),
          attempt_number:
            attemptNumber.trim() === "" ? Number(DEFAULT_ATTEMPT_NUMBER) : Number(attemptNumber),
          time_seconds: timeSeconds,
          is_official: isOfficial,
          notes: notes.trim() === "" ? null : notes.trim(),
        }),
      });
      insertIfCurrentView(created, generation);
      resetPerSwimFields();
    } catch (err) {
      if (isAuthRedirect(err)) return;
      const { message, fieldErrors } = apiErrorDetails(
        err,
        "Failed to log time. Please try again.",
      );
      setCreateError(message);
      if (fieldErrors) setCreateFieldErrors(fieldErrors);
    } finally {
      setCreating(false);
    }
  }

  return {
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
  };
}
