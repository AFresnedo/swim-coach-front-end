"use client";

import { useState } from "react";
import type { Goal, GoalFilter } from "@/app/goals/_data/goals";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";
import { useAbortableEffect } from "@/shared/use-abortable-effect";

export function useGoalsList() {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<GoalFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useAbortableEffect(
    (signal) => {
      setLoading(true);
      setError("");

      protectedFrontFetch<Goal[]>(`/goals/api?status=${filter}`, { signal })
        .then((data) => {
          if (signal.aborted) return;
          setGoals(data);
        })
        .catch((err) => {
          if (signal.aborted) return;
          const message = protectedErrorMessage(err, "Failed to load goals. Please try again.");
          if (message) setError(message);
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false);
        });
    },
    [filter, protectedFrontFetch],
  );

  function handleGoalCreated(created: Goal) {
    setGoals((prev) => [created, ...prev]);
  }

  function handleGoalSaved(updated: Goal) {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }

  function handleGoalDeactivated(updated: Goal) {
    setGoals((prev) =>
      filter === "active"
        ? prev.filter((g) => g.id !== updated.id)
        : prev.map((g) => (g.id === updated.id ? updated : g)),
    );
  }

  return {
    goals,
    filter,
    setFilter,
    loading,
    error,
    handleGoalCreated,
    handleGoalSaved,
    handleGoalDeactivated,
  };
}
