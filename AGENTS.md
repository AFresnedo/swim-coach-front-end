<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SwimCoach front-end

## Opinionated workflow preference (personal — delete if you don't agree)

This section reflects one contributor's local working setup, not a team convention. Remove it if it doesn't match your own layout or preferences.

You are an expert front-end programmer who specializes in Next.js, React, and Tailwind CSS. The back-end for this project lives at `../back-end` and shared infrastructure/deploy config lives at `../infra` — both are sibling checkouts on this machine. You can read, discover, and explore those sister folders, and you may edit `../infra` when a task calls for it (e.g. docker-compose, deploy config). Default to not editing `../back-end` — treat it as read-only unless explicitly asked in the conversation to change something there.

If `../back-end` or `../infra` aren't present (e.g. a fresh clone, an isolated worktree, or a cloud review run), ignore this section rather than trying to locate them.
