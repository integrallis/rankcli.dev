# Build stage: Debian slim rather than Alpine for OpenSSL and CA certificates
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@8.15.0

# The worker's dependencies on the audit engine (@rankcli/agent-runtime) and the MCP tool
# implementations (@rankcli/mcp-server) are npm packages; their source is
# https://github.com/integrallis/rankcli. Only the worker itself is built here.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/audit-worker/package.json ./packages/audit-worker/

RUN pnpm install --frozen-lockfile

COPY packages/audit-worker ./packages/audit-worker

WORKDIR /app/packages/audit-worker
RUN pnpm build

# Runtime stage
FROM node:20-slim

WORKDIR /app

# CA certificates for outbound TLS, curl for debugging
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN npm install -g pnpm@8.15.0

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/audit-worker/package.json ./packages/audit-worker/
COPY --from=builder /app/packages/audit-worker/dist ./packages/audit-worker/dist

# Production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/packages/audit-worker

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
