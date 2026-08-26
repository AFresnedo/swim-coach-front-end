"use client";

import { useId } from "react";
import type { DeactivationReason, Goal } from "@/app/goals/_data/goals";
import { useGoalCard } from "@/app/goals/_hooks/use-goal-card";
import {
  cardClass,
  inputClass,
  inputNormalClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/shared/form-styles";

const REASON_LABELS: Record<DeactivationReason, string> = {
  reached: "Reached",
  abandoned: "Abandoned",
  other: "Other",
};

export default function GoalCard({
  goal,
  onSaved,
  onDeactivated,
}: {
  goal: Goal;
  onSaved: (goal: Goal) => void;
  onDeactivated: (goal: Goal) => void;
}) {
  const editTextId = useId();
  const deactivateReasonId = useId();
  const { mode, edit, deactivate } = useGoalCard(goal, onSaved, onDeactivated);

  return (
    <div className={cardClass} data-testid={`goal-card-${goal.id}`}>
      {mode === "edit" ? (
        <form onSubmit={edit.submit} className="flex flex-col gap-3">
          <label htmlFor={editTextId} className={labelClass}>
            Edit goal
          </label>
          <textarea
            id={editTextId}
            required
            rows={2}
            value={edit.text}
            onChange={(e) => edit.setText(e.target.value)}
            className={`${inputClass} ${inputNormalClass}`}
          />
          {edit.error && (
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
              {edit.error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={edit.saving} className={primaryButtonClass}>
              {edit.saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={edit.cancel} className={secondaryButtonClass}>
              Cancel
            </button>
          </div>
        </form>
      ) : mode === "deactivate" ? (
        <form onSubmit={deactivate.confirm} className="flex flex-col gap-3">
          <p className="text-slate-900 dark:text-slate-50">{goal.text}</p>
          <label htmlFor={deactivateReasonId} className={labelClass}>
            Reason
          </label>
          <select
            id={deactivateReasonId}
            required
            value={deactivate.reason}
            onChange={(e) => deactivate.setReason(e.target.value as DeactivationReason)}
            className={`${inputClass} ${inputNormalClass}`}
          >
            <option value="" disabled>
              Select a reason…
            </option>
            <option value="reached">Reached</option>
            <option value="abandoned">Abandoned</option>
            <option value="other">Other</option>
          </select>
          {deactivate.error && (
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
              {deactivate.error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={deactivate.saving} className={primaryButtonClass}>
              {deactivate.saving ? "Deactivating…" : "Confirm"}
            </button>
            <button type="button" onClick={deactivate.cancel} className={secondaryButtonClass}>
              Cancel
            </button>
          </div>
        </form>
      ) : goal.is_active ? (
        <div className="flex items-start justify-between gap-4">
          <p className="text-slate-900 dark:text-slate-50">{goal.text}</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={edit.start} className={secondaryButtonClass}>
              Edit
            </button>
            <button type="button" onClick={deactivate.start} className={secondaryButtonClass}>
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
