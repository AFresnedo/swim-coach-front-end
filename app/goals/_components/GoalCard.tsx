"use client";

import { useId, useState } from "react";
import type { DeactivationReason, Goal } from "@/app/goals/_components/GoalsList";
import {
  cardClass,
  inputClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/form-styles";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/lib/use-protected-front-fetch";

const REASON_LABELS: Record<DeactivationReason, string> = {
  reached: "Reached",
  abandoned: "Abandoned",
  other: "Other",
};

type Mode = "view" | "edit" | "deactivate";

export default function GoalCard({
  goal,
  onSaved,
  onDeactivated,
}: {
  goal: Goal;
  onSaved: (goal: Goal) => void;
  onDeactivated: (goal: Goal) => void;
}) {
  const protectedFrontFetch = useProtectedFrontFetch();
  const editTextId = useId();
  const deactivateReasonId = useId();

  const [mode, setMode] = useState<Mode>("view");

  const [editText, setEditText] = useState(goal.text);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deactivateReason, setDeactivateReason] = useState<DeactivationReason | "">("");
  const [deactivateSaving, setDeactivateSaving] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  function startEdit() {
    setEditText(goal.text);
    setEditError("");
    setMode("edit");
  }

  function cancelEdit() {
    setMode("view");
  }

  async function handleEditSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");

    try {
      const updated = await protectedFrontFetch<Goal>(`/api/goals/${goal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: editText }),
      });
      onSaved(updated);
      setMode("view");
    } catch (err) {
      const message = protectedErrorMessage(err, "Failed to save goal. Please try again.");
      if (message) setEditError(message);
    } finally {
      setEditSaving(false);
    }
  }

  function startDeactivate() {
    setDeactivateReason("");
    setDeactivateError("");
    setMode("deactivate");
  }

  function cancelDeactivate() {
    setMode("view");
  }

  async function handleDeactivateConfirm(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeactivateSaving(true);
    setDeactivateError("");

    try {
      const updated = await protectedFrontFetch<Goal>(`/api/goals/${goal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason: deactivateReason }),
      });
      onDeactivated(updated);
      setMode("view");
    } catch (err) {
      const message = protectedErrorMessage(err, "Failed to deactivate goal. Please try again.");
      if (message) setDeactivateError(message);
    } finally {
      setDeactivateSaving(false);
    }
  }

  return (
    <div className={cardClass} data-testid={`goal-card-${goal.id}`}>
      {mode === "edit" ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
          <label htmlFor={editTextId} className={labelClass}>
            Edit goal
          </label>
          <textarea
            id={editTextId}
            required
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`${inputClass} ${inputNormalClass}`}
          />
          {editError && (
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
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
      ) : mode === "deactivate" ? (
        <form onSubmit={handleDeactivateConfirm} className="flex flex-col gap-3">
          <p className="text-slate-900 dark:text-slate-50">{goal.text}</p>
          <label htmlFor={deactivateReasonId} className={labelClass}>
            Reason
          </label>
          <select
            id={deactivateReasonId}
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
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
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
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={startEdit} className={secondaryButtonClass}>
              Edit
            </button>
            <button type="button" onClick={startDeactivate} className={secondaryButtonClass}>
              Deactivate
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 line-through decoration-slate-300 dark:text-slate-400 dark:decoration-slate-600">
            {goal.text}
          </p>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 text-xs dark:bg-slate-800 dark:text-slate-400">
            Deactivated —{" "}
            {goal.deactivation_reason ? REASON_LABELS[goal.deactivation_reason] : "Unknown"}
          </span>
        </div>
      )}
    </div>
  );
}
