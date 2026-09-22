# ==============================================================================
# WORKNOON Refund System - Backend API Dockerfile
# Multi-stage production build for NestJS 11 + Prisma + TypeScript
# ==============================================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

# ------------------------------------------------------------------------------
# 1. Dependencies Stage
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------------------
# 2. Build Stage
# ------------------------------------------------------------------------------
FROM base AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN pnpm run build

# ------------------------------------------------------------------------------
# 3. Production Runner Stage
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma/
COPY src/policy ./src/policy
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
