"use client";

import { useEffect, useState } from "react";
import {
  cardClass,
  inputClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/form-styles";
import { ApiError } from "@/lib/front-api";
import { AuthRedirectError, useProtectedFetch } from "@/lib/use-protected-fetch";

type DeactivationReason = "reached" | "abandoned" | "other";
type Goal = {
  id: number;
  user_id: number;
  text: string;
  is_active: boolean;
  deactivation_reason: DeactivationReason | null;
  created_at: string;
};
type GoalFilter = "active" | "all";

const REASON_LABELS: Record<DeactivationReason, string> = {
  reached: "Reached",
  abandoned: "Abandoned",
  other: "Other",
};

export default function GoalsList() {
  const protectedFetch = useProtectedFetch();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<GoalFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newText, setNewText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [deactivateReason, setDeactivateReason] = useState<DeactivationReason | "">("");
  const [deactivateSaving, setDeactivateSaving] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    protectedFetch<Goal[]>(`/api/goals?status=${filter}`)
      .then((data) => {
        if (!cancelled) setGoals(data);
      })
      .catch((err) => {
        if (cancelled || err instanceof AuthRedirectError) return;
        setError(err instanceof ApiError ? err.message : "Failed to load goals. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, protectedFetch]);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const goal = await protectedFetch<Goal>("/api/goals", {
        method: "POST",
        body: JSON.stringify({ text: newText }),
      });
      setGoals((prev) => [goal, ...prev]);
      setNewText("");
    } catch (err) {
      if (err instanceof AuthRedirectError) return;
      setCreateError(
        err instanceof ApiError ? err.message : "Failed to create goal. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setEditText(goal.text);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditError("");
  }

  async function handleEditSubmit(e: React.SubmitEvent<HTMLFormElement>, goalId: number) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");

    try {
      const updated = await protectedFetch<Goal>(`/api/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: editText }),
      });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      setEditingId(null);
    } catch (err) {
      if (err instanceof AuthRedirectError) return;
      setEditError(
        err instanceof ApiError ? err.message : "Failed to save goal. Please try again.",
      );
    } finally {
      setEditSaving(false);
    }
  }

  function startDeactivate(goalId: number) {
    setDeactivatingId(goalId);
    setDeactivateReason("");
    setDeactivateError("");
  }

  function cancelDeactivate() {
    setDeactivatingId(null);
    setDeactivateReason("");
    setDeactivateError("");
  }

  async function handleDeactivateConfirm(e: React.SubmitEvent<HTMLFormElement>, goalId: number) {
    e.preventDefault();
    setDeactivateSaving(true);
    setDeactivateError("");

    try {
      const updated = await protectedFetch<Goal>(`/api/goals/${goalId}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: deactivateReason }),
      });
      setGoals((prev) =>
        filter === "active"
          ? prev.filter((g) => g.id !== goalId)
          : prev.map((g) => (g.id === goalId ? updated : g)),
      );
      setDeactivatingId(null);
    } catch (err) {
      if (err instanceof AuthRedirectError) return;
      setDeactivateError(
        err instanceof ApiError ? err.message : "Failed to deactivate goal. Please try again.",
      );
    } finally {
      setDeactivateSaving(false);
    }
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
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {createError}
          </p>
        )}
        <button type="submit" disabled={creating} className={`${primaryButtonClass} self-start`}>
          {creating ? "Adding…" : "Add goal"}
        </button>
      </form>

      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm font-medium w-fit">
        {(["active", "all"] as GoalFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-6 py-2 transition-colors ${
              filter === f
                ? "bg-gradient-aqua text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {f === "active" ? "Active" : "All"}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading && goals.length === 0 && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading goals…</p>
      )}

      {!loading && goals.length === 0 && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filter === "active"
            ? "No active goals yet — create one above."
            : "No goals yet — create one above."}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className={cardClass}>
            {editingId === goal.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, goal.id)} className="flex flex-col gap-3">
                <label htmlFor="edit-goal-text" className={labelClass}>
                  Edit goal
                </label>
                <textarea
                  id="edit-goal-text"
                  required
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className={`${inputClass} ${inputNormalClass}`}
                />
                {editError && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {editError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={editSaving} className={primaryButtonClass}>
                    {editSaving ? "Saving…" : "Save"}
                  </button>
                  <button type="button" onClick={cancelEdit} className={secondaryButtonClass}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : deactivatingId === goal.id ? (
              <form
                onSubmit={(e) => handleDeactivateConfirm(e, goal.id)}
                className="flex flex-col gap-3"
              >
                <p className="text-slate-900 dark:text-slate-50">{goal.text}</p>
                <label htmlFor="deactivate-reason" className={labelClass}>
                  Reason
                </label>
                <select
                  id="deactivate-reason"
                  required
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value as DeactivationReason)}
                  className={`${inputClass} ${inputNormalClass}`}
                >
                  <option value="" disabled>
                    Select a reason…
                  </option>
                  <option value="reached">Reached</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="other">Other</option>
                </select>
                {deactivateError && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {deactivateError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={deactivateSaving} className={primaryButtonClass}>
                    {deactivateSaving ? "Deactivating…" : "Confirm"}
                  </button>
                  <button type="button" onClick={cancelDeactivate} className={secondaryButtonClass}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : goal.is_active ? (
              <div className="flex items-start justify-between gap-4">
                <p className="text-slate-900 dark:text-slate-50">{goal.text}</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(goal)}
                    className={secondaryButtonClass}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => startDeactivate(goal.id)}
                    className={secondaryButtonClass}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600">
                  {goal.text}
                </p>
                <span className="w-fit rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  Deactivated —{" "}
                  {goal.deactivation_reason ? REASON_LABELS[goal.deactivation_reason] : "Unknown"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
