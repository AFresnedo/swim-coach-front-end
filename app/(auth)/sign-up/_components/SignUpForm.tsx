"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "@/app/(auth)/sign-up/_components/Turnstile";
import { useSignUpForm } from "@/app/(auth)/sign-up/_hooks/use-sign-up-form";
import Field from "@/components/Field";
import { PasswordField } from "@/components/PasswordField";
import {
  inputClass,
  inputErrorClass,
  inputNormalClass,
  primaryButtonLargeClass,
} from "@/shared/form-styles";

export default function SignUpForm({ nonce }: { nonce: string | null }) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

  const {
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
  } = useSignUpForm(turnstileToken, () => turnstileRef.current?.reset());

  return (
    <div className="flex min-h-full items-center justify-center bg-page-gradient px-6 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-cyan-500/5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 font-bold text-2xl text-slate-900 dark:text-slate-50">
          Create your account
        </h1>
        <p className="mb-8 text-slate-500 text-sm dark:text-slate-400">
          Start improving your lap times today.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field htmlFor="name" label="Full name" error={fieldErrors.name}>
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
          </Field>

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
            <p role="alert" className="text-red-600 text-sm dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-start gap-2 pt-1">
            <input
              id="acknowledge-disclaimer"
              type="checkbox"
              required
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            />
            <label
              htmlFor="acknowledge-disclaimer"
              className="text-slate-500 text-xs dark:text-slate-400"
            >
              I understand this site&apos;s advice has not been reviewed by a professional and I use
              it at my own risk. Read our{" "}
              <Link
                href="/disclaimer"
                target="_blank"
                className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
              >
                disclaimer
              </Link>
              .
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="acknowledge-data-wipe"
              type="checkbox"
              required
              checked={acknowledgedDataWipe}
              onChange={(e) => setAcknowledgedDataWipe(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600"
            />
            <label
              htmlFor="acknowledge-data-wipe"
              className="text-slate-500 text-xs dark:text-slate-400"
            >
              I understand this site is still under active development and my account data
              (including swim times, goals, and profile info) may be wiped or reset at any time
              without notice.
            </label>
          </div>

          <Turnstile
            ref={turnstileRef}
            nonce={nonce}
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
            onError={() =>
              setError(
                "CAPTCHA failed to load. Disable any ad or script blockers and reload the page.",
              )
            }
          />

          <button
            type="submit"
            disabled={loading || !acknowledged || !acknowledgedDataWipe || !turnstileToken}
            className={`${primaryButtonLargeClass} mt-2`}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-sm dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
