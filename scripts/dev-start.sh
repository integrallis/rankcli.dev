#!/bin/bash
# Start all development services
# Usage: ./scripts/dev-start.sh

set -e

cd /workspace

# Kill any existing processes on our ports
echo "Cleaning up ports 3005 and 8080..."
lsof -ti:3005,3006,3007,3008,8080 | xargs -r kill -9 2>/dev/null || true

# Export env vars for the worker
export SUPABASE_URL=$VITE_SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
export WORKER_SECRET=dev-secret
export PORT=8080

echo ""
echo "Starting RankCLI Development Services..."
echo "========================================"
echo ""

# Start audit worker in background
echo "Starting Audit Worker on :8080..."
cd /workspace/packages/audit-worker
pnpm dev &
WORKER_PID=$!

# Wait for worker to be ready
sleep 2

# Start SaaS frontend
echo "Starting SaaS Frontend on :3005..."
cd /workspace/packages/saas
pnpm dev &
SAAS_PID=$!

echo ""
echo "========================================"
echo "Services started:"
echo "  - SaaS Frontend: http://localhost:3005 (PID: $SAAS_PID)"
echo "  - Audit Worker:  http://localhost:8080 (PID: $WORKER_PID)"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================"
echo ""

# Wait for either process to exit
wait
