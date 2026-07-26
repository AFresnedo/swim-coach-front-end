"use client";

import { useState } from "react";
import type { Goal } from "@/app/goals/_data/goals";
import { protectedErrorMessage, useProtectedFrontFetch } from "@/shared/protected-fetch";

export function useCreateGoalForm(onCreated: (goal: Goal) => void) {
  const protectedFrontFetch = useProtectedFrontFetch();
  const [newText, setNewText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const goal = await protectedFrontFetch<Goal>("/goals/api", {
        method: "POST",
        body: JSON.stringify({ text: newText }),
      });
      onCreated(goal);
      setNewText("");
    } catch (err) {
      const message = protectedErrorMessage(err, "Failed to create goal. Please try again.");
      if (message) setCreateError(message);
    } finally {
      setCreating(false);
    }
  }

  return {
    newText,
    setNewText,
    creating,
    createError,
    handleCreate,
  };
}
