"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { inputClass, inputErrorClass, inputNormalClass, labelClass } from "@/lib/form-styles";
import { ApiError, frontApiFetch } from "@/lib/front-api";

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
      await frontApiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-24 bg-page-gradient">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg shadow-cyan-500/5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Sign in to continue your training.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
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
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

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
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-gradient-aqua px-4 py-3 text-sm font-semibold text-white shadow-aqua hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-[filter]"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
