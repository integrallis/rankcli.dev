#!/bin/bash
# Post-start script - runs every time the container starts
# Starts development services in background

# Fix docker socket permissions
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

cd /workspace

# Load environment variables from .env file
if [ -f /workspace/.env ]; then
  set -a
  source /workspace/.env
  set +a
fi

# Kill any stale processes on our ports
lsof -ti:3005,3006,3007,3008,8080 | xargs -r kill -9 2>/dev/null || true

# Export env vars for the worker (map VITE_ prefixed vars to worker vars)
export SUPABASE_URL="${VITE_SUPABASE_URL}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_KEY}"
export OPENAI_API_KEY="${OPENAI_API_KEY}"
export WORKER_SECRET="${WORKER_SECRET:-dev-secret}"
export PORT=8080

echo ""
echo "========================================"
echo "  Starting RankCLI Development Services"
echo "========================================"
echo ""

# Verify critical env vars are set
if [ -z "$SUPABASE_URL" ]; then
  echo "WARNING: SUPABASE_URL not set. Check /workspace/.env file."
fi
if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY not set. AI features will be disabled."
fi

# Ensure builds are up to date
echo "Building packages..."
cd /workspace/packages/agent-runtime && pnpm build 2>/dev/null
cd /workspace/packages/audit-worker && pnpm build 2>/dev/null
cd /workspace

# Start audit worker in background
echo "Starting Audit Worker on :8080..."
cd /workspace/packages/audit-worker
nohup node dist/index.js > /tmp/audit-worker.log 2>&1 &
echo $! > /tmp/audit-worker.pid
cd /workspace

# Wait for worker to be ready
sleep 2

# Start SaaS frontend in background
echo "Starting SaaS Frontend on :3005..."
cd /workspace/packages/saas
nohup pnpm dev > /tmp/saas-frontend.log 2>&1 &
echo $! > /tmp/saas-frontend.pid
cd /workspace

echo ""
echo "========================================"
echo "Services started in background:"
echo "  - SaaS Frontend: http://localhost:3005"
echo "  - Audit Worker:  http://localhost:8080"
echo ""
echo "View logs:"
echo "  tail -f /tmp/saas-frontend.log"
echo "  tail -f /tmp/audit-worker.log"
echo ""
echo "Stop services:"
echo "  kill \$(cat /tmp/saas-frontend.pid /tmp/audit-worker.pid)"
echo "========================================"
echo ""
