# SwimCoach

[![CI](https://github.com/AFresnedo/swim-coach-front-end/actions/workflows/ci.yml/badge.svg)](https://github.com/AFresnedo/swim-coach-front-end/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)](LICENSE)

Next.js frontend for [SwimCoach](https://swim-coach-ai.com), a website for personalized,
AI-assisted swim instruction. Ships auth (sign-up/sign-in/logout), a profile section, a
goals feature, a swim log, and per-stroke technique/drill pages, backed by the
[swim-coach-back-end](https://github.com/AFresnedo/swim-coach-back-end) FastAPI API.

Sibling repos: [back-end](https://github.com/AFresnedo/swim-coach-back-end) ·
[infra](https://github.com/AFresnedo/swim-coach-infra) (shared docker-compose, deploy target)

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Biome · Vitest · Playwright

## Architecture

Next.js API routes under `app/api/` act as a proxy layer in front of the backend (a
BFF — backend-for-frontend — pattern): the browser never talks to the FastAPI API
directly, and server-only secrets (like the Turnstile secret key) never reach the
client. Auth state, protected routes, and session expiry are handled client-side on
top of that.

## Setup

This app expects the [back-end](https://github.com/AFresnedo/swim-coach-back-end) running
locally at `http://localhost:8000` (see its README for setup).

```bash
npm install
cp .env.example .env.local  # see Environment variables below; defaults work for local dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

All variables are documented in [`.env.example`](.env.example); the notable ones:

| Variable | Default | Notes |
| --- | --- | --- |
| `API_URL` | `http://localhost:8000` | server-side only, never exposed to the browser |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | — | Cloudflare Turnstile (sign-up CAPTCHA) site key |
| `TURNSTILE_SECRET_KEY` | — | Turnstile secret key, verified server-side |
| `NEXT_PUBLIC_TURNSTILE_TEST_MODE` | `true` | bypasses Turnstile entirely for local dev; never set in staging/prod |

`SITE_INDEXABLE` is a prod-only launch gate with no local-dev use case — it's owned by
the [infra](https://github.com/AFresnedo/swim-coach-infra) repo's `.env.example` and
wired through its `docker-compose.yml`, not this repo's.

## Testing

```bash
npm test            # Vitest — component/unit tests
npx playwright install chromium   # one-time, before the first e2e run
npm run test:e2e     # Playwright — end-to-end flows
```

Playwright covers auth, route protection, goals authorization, session expiry, and
mobile navigation, auto-starting the dev server (`npm run dev`) against
`http://localhost:3000` if one isn't already running.

## Linting & formatting

```bash
npm run lint     # Biome lint
npm run format   # Biome format, auto-fix in place
npm run check    # Biome lint + format, auto-fix in place
```

## Git Hooks (optional)

`next.config.ts` enables Turbopack's dev filesystem cache (`turbopackFileSystemCacheForDev`), which speeds up `next dev` but can serve stale output after a branch switch, pull, or merge bulk-changes files outside its normal one-file-at-a-time watcher model. This repo includes hooks in `.githooks/` that print a warning on those events, telling you to run `rm -rf .next` and restart your dev server. They warn rather than clear `.next` automatically, since deleting it out from under a running dev server breaks it (500s) until restarted — that has to stay a step you do deliberately.

They're **not active by default** — cloning the repo does not turn them on. To opt in, run once per clone:

```bash
git config core.hooksPath .githooks
```

## Continuous Integration & deployment

`main` is a protected branch — all changes go through a pull request, merged
squash-only once CI passes. [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs
Biome lint/format checks, TypeScript type checking, the Vitest suite, and a Playwright
e2e run on every PR and push to `main`. [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml)
runs GitHub's CodeQL security analysis on the same triggers.

On every push to `main`, [`.github/workflows/cd.yml`](.github/workflows/cd.yml) builds and
pushes a Docker image to GHCR, then deploys over SSH to the production Droplet, finishing
with a smoke test. This app deploys as a Docker container behind Caddy on a self-managed
Droplet (see the [infra](https://github.com/AFresnedo/swim-coach-infra) repo) — not Vercel.

[Dependabot](.github/dependabot.yml) opens PRs weekly for outdated dependencies and
GitHub Actions versions; they go through the same CI gate as any other PR.

## License

All rights reserved — see [LICENSE](LICENSE). This repo is public for reference and
portfolio purposes only; no permission is granted to use, copy, modify, or distribute
this code, and it isn't open to outside contributions.
