"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Field from "@/components/Field";
import { PasswordField } from "@/components/PasswordField";
import {
  inputClass,
  inputErrorClass,
  inputNormalClass,
  primaryButtonLargeClass,
} from "@/shared/form-styles";
import { apiErrorDetails, frontApiFetch } from "@/shared/front-api";

// useSearchParams suspends the tree up to the nearest Suspense boundary
// during static builds, so it's isolated here rather than called directly
// in the page body.
function SessionExpiredBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("sessionExpired") !== "1") return null;
  return (
    <p
      role="status"
      className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-amber-700 text-sm dark:bg-amber-500/10 dark:text-amber-400"
    >
      Your session expired — please sign in again.
    </p>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await frontApiFetch("/sign-in/api", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      const { message, fieldErrors } = apiErrorDetails(err, "Sign in failed. Please try again.");
      setError(message);
      if (fieldErrors) setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-page-gradient px-6 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-cyan-500/5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 font-bold text-2xl text-slate-900 dark:text-slate-50">Welcome back</h1>
        <p className="mb-8 text-slate-500 text-sm dark:text-slate-400">
          Sign in to continue your training.
        </p>

        <Suspense fallback={null}>
          <SessionExpiredBanner />
        </Suspense>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field htmlFor="email" label="Email" error={fieldErrors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} ${fieldErrors.email ? inputErrorClass : inputNormalClass}`}
              placeholder="you@example.com"
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
          </Field>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={`${primaryButtonLargeClass} mt-2`}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
