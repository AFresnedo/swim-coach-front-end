"use client";

import { useState } from "react";
import type { DeactivationReason, Goal } from "@/app/goals/_data/goals";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";

export type Mode = "view" | "edit" | "deactivate";

export type GoalCardEditState = {
  text: string;
  setText: (value: string) => void;
  saving: boolean;
  error: string;
  start: () => void;
  cancel: () => void;
  submit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
};

export type GoalCardDeactivateState = {
  reason: DeactivationReason | "";
  setReason: (value: DeactivationReason | "") => void;
  saving: boolean;
  error: string;
  start: () => void;
  cancel: () => void;
  confirm: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
};

type SubmitGoalPatchOptions<TPayload> = {
  event: React.SubmitEvent<HTMLFormElement>;
  pathSuffix: string;
  payload: TPayload;
  onSuccess: (goal: Goal) => void;
  fallbackMessage: string;
  setSaving: (value: boolean) => void;
  setError: (value: string) => void;
};

export function useGoalCard(
  goal: Goal,
  onSaved: (goal: Goal) => void,
  onDeactivated: (goal: Goal) => void,
) {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [mode, setMode] = useState<Mode>("view");

  const [text, setText] = useState(goal.text);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [reason, setReason] = useState<DeactivationReason | "">("");
  const [deactivateSaving, setDeactivateSaving] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  function cancel() {
    setMode("view");
  }

  async function submitGoalPatch<TPayload>({
    event,
    pathSuffix,
    payload,
    onSuccess,
    fallbackMessage,
    setSaving,
    setError,
  }: SubmitGoalPatchOptions<TPayload>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updated = await protectedFrontFetch<Goal>(`/goals/api/${goal.id}${pathSuffix}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      onSuccess(updated);
      setMode("view");
    } catch (err) {
      const message = protectedErrorMessage(err, fallbackMessage);
      if (message) setError(message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setText(goal.text);
    setEditError("");
    setMode("edit");
  }

  async function submitEdit(event: React.SubmitEvent<HTMLFormElement>) {
    await submitGoalPatch({
      event,
      pathSuffix: "",
      payload: { text },
      onSuccess: onSaved,
      fallbackMessage: "Failed to save goal. Please try again.",
      setSaving: setEditSaving,
      setError: setEditError,
    });
  }

  function startDeactivate() {
    setReason("");
    setDeactivateError("");
    setMode("deactivate");
  }

  async function confirmDeactivate(event: React.SubmitEvent<HTMLFormElement>) {
    await submitGoalPatch({
      event,
      pathSuffix: "/deactivate",
      payload: { reason },
      onSuccess: onDeactivated,
      fallbackMessage: "Failed to deactivate goal. Please try again.",
      setSaving: setDeactivateSaving,
      setError: setDeactivateError,
    });
  }

  const edit: GoalCardEditState = {
    text,
    setText,
    saving: editSaving,
    error: editError,
    start: startEdit,
    cancel,
    submit: submitEdit,
  };

  const deactivate: GoalCardDeactivateState = {
    reason,
    setReason,
    saving: deactivateSaving,
    error: deactivateError,
    start: startDeactivate,
    cancel,
    confirm: confirmDeactivate,
  };

  return { mode, edit, deactivate };
}
