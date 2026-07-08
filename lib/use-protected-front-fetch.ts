"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError, frontApiFetch } from "@/lib/front-api";

// Thrown after useProtectedFrontFetch has already redirected to /sign-in, so
// callers can bail out of their own catch block instead of also showing a
// "failed to load" message right before the page navigates away.
export class AuthRedirectError extends Error {
  constructor() {
    super("Session expired, redirecting to sign-in");
    this.name = "AuthRedirectError";
  }
}

// Wraps frontApiFetch for protected-resource calls (goals, swim times,
// profile, account actions). A 401 here means the session expired or is
// invalid, so it redirects to /sign-in instead of surfacing a generic
// error. Login/sign-up call frontApiFetch directly, since a 401 there means
// wrong credentials rather than an expired session.
export function useProtectedFrontFetch() {
  const router = useRouter();

  return useCallback(
    // Rest-spread so a call with no options object reaches frontApiFetch as
    // a one-argument call, matching direct frontApiFetch call sites exactly.
    async function protectedFrontFetch<T>(path: string, ...args: [RequestInit] | []): Promise<T> {
      try {
        return await frontApiFetch<T>(path, ...args);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/sign-in?sessionExpired=1");
          throw new AuthRedirectError();
        }
        throw err;
      }
    },
    [router],
  );
}
