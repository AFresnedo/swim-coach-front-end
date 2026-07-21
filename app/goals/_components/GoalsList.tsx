"use client";

import { useState } from "react";
import GoalCard from "@/app/goals/_components/GoalCard";
import {
  cardClass,
  inputClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
} from "@/shared/form-styles";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";
import { useAbortableEffect } from "@/shared/use-abortable-effect";

export type DeactivationReason = "reached" | "abandoned" | "other";
export type Goal = {
  id: number;
  user_id: number;
  text: string;
  is_active: boolean;
  deactivation_reason: DeactivationReason | null;
  created_at: string;
};
type GoalFilter = "active" | "all";

export default function GoalsList() {
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

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleCreate} className={`${cardClass} flex flex-col gap-3`}>
        <label htmlFor="new-goal-text" className={labelClass}>
          New goal
        </label>
        <textarea
          id="new-goal-text"
          required
          rows={2}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className={`${inputClass} ${inputNormalClass}`}
          placeholder="e.g. Swim a sub-1:00 100m free"
        />
        {createError && (
          <p role="alert" className="text-red-600 text-sm dark:text-red-400">
            {createError}
          </p>
        )}
        <button type="submit" disabled={creating} className={`${primaryButtonClass} self-start`}>
          {creating ? "Adding…" : "Add goal"}
        </button>
      </form>

      <div className="flex w-fit overflow-hidden rounded-lg border border-slate-200 font-medium text-sm dark:border-slate-700">
        {(["active", "all"] as GoalFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-6 py-2 transition-colors ${
              filter === f
                ? "bg-gradient-aqua text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {f === "active" ? "Active" : "All"}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-red-600 text-sm dark:text-red-400">
          {error}
        </p>
      )}

      {loading && goals.length === 0 && !error && (
        <p className="text-slate-500 text-sm dark:text-slate-400">Loading goals…</p>
      )}

      {!loading && goals.length === 0 && !error && (
        <p className="text-slate-500 text-sm dark:text-slate-400">
          {filter === "active"
            ? "No active goals yet — create one above."
            : "No goals yet — create one above."}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onSaved={handleGoalSaved}
            onDeactivated={handleGoalDeactivated}
          />
        ))}
      </div>
    </div>
  );
}
