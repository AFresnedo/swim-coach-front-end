"use client";

import { useState } from "react";
import type { DeactivationReason, Goal } from "@/app/goals/_data/goals";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";

type Mode = "view" | "edit" | "deactivate";

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

  function startEdit() {
    setText(goal.text);
    setEditError("");
    setMode("edit");
  }

  function cancelEdit() {
    setMode("view");
  }

  async function submitEdit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");

    try {
      const updated = await protectedFrontFetch<Goal>(`/goals/api/${goal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text }),
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
    setReason("");
    setDeactivateError("");
    setMode("deactivate");
  }

  function cancelDeactivate() {
    setMode("view");
  }

  async function confirmDeactivate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeactivateSaving(true);
    setDeactivateError("");

    try {
      const updated = await protectedFrontFetch<Goal>(`/goals/api/${goal.id}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
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

  return {
    mode,
    edit: {
      text,
      setText,
      saving: editSaving,
      error: editError,
      start: startEdit,
      cancel: cancelEdit,
      submit: submitEdit,
    },
    deactivate: {
      reason,
      setReason,
      saving: deactivateSaving,
      error: deactivateError,
      start: startDeactivate,
      cancel: cancelDeactivate,
      confirm: confirmDeactivate,
    },
  };
}
