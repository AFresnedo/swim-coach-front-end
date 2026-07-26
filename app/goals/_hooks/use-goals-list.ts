"use client";

import { useState } from "react";
import type { Goal } from "@/app/goals/_data/goals";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";
import { useAbortableEffect } from "@/shared/use-abortable-effect";

export type GoalFilter = "active" | "all";

export function useGoalsList() {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<GoalFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newText, setNewText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const goal = await protectedFrontFetch<Goal>("/goals/api", {
        method: "POST",
        body: JSON.stringify({ text: newText }),
      });
      setGoals((prev) => [goal, ...prev]);
      setNewText("");
    } catch (err) {
      const message = protectedErrorMessage(err, "Failed to create goal. Please try again.");
      if (message) setCreateError(message);
    } finally {
      setCreating(false);
    }
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
    newText,
    setNewText,
    creating,
    createError,
    handleCreate,
    handleGoalSaved,
    handleGoalDeactivated,
  };
}
