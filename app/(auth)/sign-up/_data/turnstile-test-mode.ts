// Bypasses the Turnstile widget (_components/Turnstile.tsx) and siteverify
// call (api/route.ts) entirely when true. Only ever set in .env.local for
// local dev/e2e — never in ../infra's staging/prod env config, or sign-up
// ships with no CAPTCHA enforcement. Read via the NEXT_PUBLIC_ name
// (NEXT_PUBLIC_ vars are also readable server-side) so there's one flag to
// set, not two independently-named ones that can drift. The
// `NODE_ENV !== "production"` clause is defense in depth: today's build
// pipeline never bakes this flag into a production image at all, but this
// guarantees the bypass can never activate in prod even if that ever changed.
export const TURNSTILE_TEST_MODE =
  process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "true" && process.env.NODE_ENV !== "production";
