export const AUTH_COOKIE = "access_token";

// Soft-launch gate: set SITE_INDEXABLE=true in the environment once the site
// is ready for crawlers/search engines. Fails closed (not indexable) if
// unset, so a missing env var can't accidentally expose an unfinished site.
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

// Bypasses the Turnstile widget (components/Turnstile.tsx) and siteverify
// call (app/api/auth/register/route.ts) entirely when true. Only ever set in
// .env.local for local dev/e2e — never in ../infra's staging/prod env
// config, or sign-up ships with no CAPTCHA enforcement. Read via the
// NEXT_PUBLIC_ name (NEXT_PUBLIC_ vars are also readable server-side) so
// there's one flag to set, not two independently-named ones that can drift.
export const TURNSTILE_TEST_MODE = process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "true";
