"use client";

import { useState } from "react";
import { apiErrorDetails } from "@/lib/front-api";
import { type Course, parseMmSs, type Stroke, type SwimTime } from "@/lib/swim-times-data";
import { isAuthRedirect, useProtectedFrontFetch } from "@/lib/use-protected-front-fetch";

export function useCreateSwimTimeForm({
  selectedDate,
  getViewGeneration,
  addIfVisible,
}: {
  selectedDate: string;
  getViewGeneration: () => number;
  addIfVisible: (created: SwimTime, generation: number) => void;
}) {
  const protectedFrontFetch = useProtectedFrontFetch();
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
      const created = await protectedFrontFetch<SwimTime>("/api/swim-times", {
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
      addIfVisible(created, generation);
      setLength("");
      setTimeText("");
      setAttemptNumber("1");
      setNotes("");
      setIsOfficial(false);
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
