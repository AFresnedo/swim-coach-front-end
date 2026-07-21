FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY next.config.ts postcss.config.mjs tsconfig.json proxy.ts ./
COPY app/ app/
COPY components/ components/
COPY features/ features/
COPY lib/ lib/
COPY public/ public/

# NEXT_PUBLIC_* vars are inlined into the build output, not read at container
# runtime — this has to be a build-time ARG, not a docker-compose env var.
# Placed right before the build step (rather than near the other COPYs) so
# changing it only invalidates this layer, not the npm ci cache above.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
# Docker sets HOSTNAME to the container ID by default, which the standalone
# server.js picks up via `process.env.HOSTNAME || '0.0.0.0'` and binds to —
# override it so the server actually listens on all interfaces.
# WARNING: This setting needs to be changed if frontend is published
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
