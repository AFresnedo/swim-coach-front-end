"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiErrorDetails, frontApiFetch } from "@/shared/front-api";

export function useSignUpForm(turnstileToken: string, resetTurnstile: () => void) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgedDataWipe, setAcknowledgedDataWipe] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      await frontApiFetch("/sign-up/api", {
        method: "POST",
        body: JSON.stringify({ name, email, password, turnstileToken }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      const { message, fieldErrors } = apiErrorDetails(err, "Sign up failed. Please try again.");
      setError(message);
      if (fieldErrors) setFieldErrors(fieldErrors);
      // The submitted token is consumed by Cloudflare on the first verify
      // attempt regardless of why registration failed, so any retry needs a
      // fresh one.
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    fieldErrors,
    loading,
    acknowledged,
    setAcknowledged,
    acknowledgedDataWipe,
    setAcknowledgedDataWipe,
    handleSubmit,
  };
}
