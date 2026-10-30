#!/bin/bash
# RankCLI Local Testing Setup
# Prepares the system for local development and testing: Node and pnpm are the only
# prerequisites (the Rust/WASM build the CLI used to need is gone).

set -e

echo "=================================="
echo "RankCLI Local Testing Setup"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    echo -e "${RED}Error: Run this script from the project root directory${NC}"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
echo "Step 1: Checking prerequisites..."
echo "--------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Install Node.js 20+"
    exit 1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm: $PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found. Run: npm install -g pnpm"
    exit 1
fi

echo ""
echo "Step 2: Installing dependencies..."
echo "----------------------------------"
pnpm install

echo ""
echo "Step 3: Building agent-runtime..."
echo "---------------------------------"
cd packages/agent-runtime
pnpm build
echo -e "${GREEN}✓${NC} agent-runtime built"
cd ../..

echo ""
echo "Step 4: Building the CLI..."
echo "---------------------------"
cd packages/cli
pnpm build:js
echo -e "${GREEN}✓${NC} CLI built"
cd ../..

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Available commands:"
echo ""
echo "  ${GREEN}Audit a site with the local build:${NC}"
echo "  node packages/cli/dist/index.js audit --url https://example.com"
echo ""
echo "  ${GREEN}Check the 21 formerly encrypted checks run end to end:${NC}"
echo "  cd packages/cli && node scripts/verify-premium-audit.js"
echo ""
echo "  ${GREEN}Start SaaS dev server:${NC}"
echo "  cd packages/saas && pnpm dev"
echo ""
echo "  ${GREEN}Run all tests:${NC}"
echo "  pnpm test"
echo ""
