# syntax=docker/dockerfile:1
# Build context: repository root.
# `dev` runs the Vite dev server; a static production stage is added in Phase 7.
FROM node:24-alpine AS dev

RUN npm install -g pnpm@12.6.0
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @codether/web...

COPY packages/shared/src packages/shared/src
COPY apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev"]
