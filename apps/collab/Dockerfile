# syntax=docker/dockerfile:1
# Build context: repository root.
FROM node:24-alpine

RUN npm install -g pnpm@12.6.0
WORKDIR /app

# Install deps first so this layer is cached across source-only changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/collab/package.json apps/collab/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @codether/collab...

COPY packages/shared/src packages/shared/src
COPY apps/collab/src apps/collab/src

ENV NODE_ENV=production
USER node
EXPOSE 4000
# Runs TypeScript directly via Node's built-in type stripping; no build step.
CMD ["node", "apps/collab/src/index.ts"]
