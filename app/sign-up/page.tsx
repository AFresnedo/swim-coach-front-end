"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { ApiError, frontApiFetch } from "@/lib/front-api";

const inputClass =
  "rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full";
const inputErrorClass = "border-red-400 dark:border-red-500";
const inputNormalClass = "border-slate-200 dark:border-slate-700";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
      await frontApiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-24 bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg shadow-cyan-500/5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
          Create your account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Start improving your lap times today.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} ${fieldErrors.name ? inputErrorClass : inputNormalClass}`}
              placeholder="Jane Smith"
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
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
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            placeholder="At least 8 characters"
          />

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={fieldErrors.confirmPassword}
            placeholder="Re-enter your password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
