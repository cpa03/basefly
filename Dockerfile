# =============================================================================
# Basefly - Multi-stage Dockerfile for production deployment
# =============================================================================
# This Dockerfile builds the Next.js application in a monorepo using pnpm
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Install dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc turbo.json ./
COPY apps/nextjs/package.json ./apps/nextjs/
COPY packages/*/package.json ./packages/
COPY tooling/*/package.json ./tooling/

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# -----------------------------------------------------------------------------
# Stage 2: Builder - Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the Next.js application
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 3: Production - Run the application
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# Copy package files for production dependencies
COPY package.json pnpm-lock.yaml .npmrc turbo.json ./
COPY apps/nextjs/package.json ./apps/nextjs/
COPY packages/*/package.json ./packages/
COPY tooling/*/package.json ./tooling/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod --prefer-offline

# Copy built artifacts from builder
COPY --from=builder /app/apps/nextjs/.next ./apps/nextjs/.next
COPY --from=builder /app/apps/nextjs/public ./apps/nextjs/public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.next ./node_modules/.next
COPY --from=builder /app/packages ./packages

# Copy environment file template
COPY --from=builder /app/.env.example .env

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set ownership
RUN chown nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["pnpm", "--filter", "@saasfly/nextjs", "start"]
