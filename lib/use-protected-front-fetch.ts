"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
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

export function isAuthRedirect(err: unknown): err is AuthRedirectError {
  return err instanceof AuthRedirectError;
}

// Shared shape for the common catch-block pattern: bail out silently on an
// auth redirect, otherwise fall back to a generic message. Returns null when
// the caller should do nothing further.
export function protectedErrorMessage(err: unknown, fallback: string): string | null {
  if (isAuthRedirect(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

// Wraps frontApiFetch for protected-resource calls (goals, swim times,
// profile, account actions). A 401 here means the session expired or is
// invalid, so it redirects to /sign-in instead of surfacing a generic
// error. Login/sign-up call frontApiFetch directly, since a 401 there means
// wrong credentials rather than an expired session.
export function useProtectedFrontFetch() {
  const router = useRouter();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(
    // Rest-spread so a call with no options object reaches frontApiFetch as
    // a one-argument call, matching direct frontApiFetch call sites exactly.
    async function protectedFrontFetch<T>(path: string, ...args: [RequestInit] | []): Promise<T> {
      try {
        return await frontApiFetch<T>(path, ...args);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Only redirect if the component that made this request is still
          // mounted — otherwise a stale request resolving after the user
          // already navigated elsewhere would yank them back to /sign-in.
          // Use replace (not push) so bouncing back with the browser's
          // back button can't re-enter the protected page and re-trigger
          // this same redirect. Follow with refresh() so the root layout's
          // Header (a Server Component) re-checks auth state instead of
          // continuing to show the logged-in nav.
          if (isMountedRef.current) {
            router.replace("/sign-in?sessionExpired=1");
            router.refresh();
          }
          throw new AuthRedirectError();
        }
        throw err;
      }
    },
    [router],
  );
}
