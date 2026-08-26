"use client";

import GoalCard from "@/app/goals/_components/GoalCard";
import type { GoalFilter } from "@/app/goals/_data/goals";
import { useCreateGoalForm } from "@/app/goals/_hooks/use-create-goal-form";
import { useGoalsList } from "@/app/goals/_hooks/use-goals-list";
import {
  cardClass,
  inputClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
} from "@/shared/form-styles";

export default function GoalsList() {
  const {
    goals,
    filter,
    setFilter,
    loading,
    error,
    handleGoalCreated,
    handleGoalSaved,
    handleGoalDeactivated,
  } = useGoalsList();
  const { newText, setNewText, creating, createError, handleCreate } =
    useCreateGoalForm(handleGoalCreated);

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
