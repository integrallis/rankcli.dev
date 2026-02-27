# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/agent-runtime/package.json ./packages/agent-runtime/
COPY packages/audit-worker/package.json ./packages/audit-worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/agent-runtime ./packages/agent-runtime
COPY packages/audit-worker ./packages/audit-worker

# Build agent-runtime first
WORKDIR /app/packages/agent-runtime
RUN pnpm build

# Build audit-worker
WORKDIR /app/packages/audit-worker
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install CA certificates for TLS verification
RUN apk add --no-cache ca-certificates

# Install pnpm for workspace linking
RUN npm install -g pnpm

# Copy built packages
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/agent-runtime/package.json ./packages/agent-runtime/
COPY --from=builder /app/packages/agent-runtime/dist ./packages/agent-runtime/dist
COPY --from=builder /app/packages/audit-worker/package.json ./packages/audit-worker/
COPY --from=builder /app/packages/audit-worker/dist ./packages/audit-worker/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/packages/audit-worker

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start
CMD ["node", "dist/index.js"]
