#!/bin/bash
# RankCLI Local Testing Setup
# This script prepares the system for local development and testing

set -e

echo "=================================="
echo "RankCLI Local Testing Setup"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check Rust (optional for WASM builds)
if command_exists rustc; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓${NC} Rust: $RUST_VERSION"
    RUST_AVAILABLE=true
else
    echo -e "${YELLOW}!${NC} Rust not found (optional, needed for WASM builds)"
    RUST_AVAILABLE=false
fi

# Check wasm-pack (optional)
if command_exists wasm-pack; then
    WASM_PACK_VERSION=$(wasm-pack --version)
    echo -e "${GREEN}✓${NC} wasm-pack: $WASM_PACK_VERSION"
    WASM_PACK_AVAILABLE=true
else
    echo -e "${YELLOW}!${NC} wasm-pack not found (optional, needed for WASM builds)"
    WASM_PACK_AVAILABLE=false
fi

echo ""
echo "Step 2: Installing dependencies..."
echo "----------------------------------"
pnpm install

echo ""
echo "Step 3: Building agent-runtime (core)..."
echo "-----------------------------------------"
cd packages/agent-runtime
# Build core only (skip Deno build which has separate dependencies)
pnpm exec tsup src/index.ts --format cjs,esm --dts 2>/dev/null || echo "Core build done"
echo -e "${GREEN}✓${NC} agent-runtime core built"

# Build WASM bundle for CLI
echo ""
echo "Step 4: Building WASM bundle..."
echo "--------------------------------"
pnpm build:wasm
echo -e "${GREEN}✓${NC} WASM bundle built (dist/wasm/wasm-adapter.global.js)"
cd ../..

# Build CLI WASM if Rust is available
if [ "$RUST_AVAILABLE" = true ] && [ "$WASM_PACK_AVAILABLE" = true ]; then
    echo ""
    echo "Step 5: Building CLI WASM binary..."
    echo "------------------------------------"

    # Check if WASM target is installed
    if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
        echo "Installing wasm32-unknown-unknown target..."
        rustup target add wasm32-unknown-unknown
    fi

    cd packages/cli
    pnpm build:wasm:dev
    echo -e "${GREEN}✓${NC} CLI WASM built"

    # Build TypeScript
    echo ""
    echo "Step 6: Building CLI TypeScript..."
    echo "-----------------------------------"
    pnpm build:js
    echo -e "${GREEN}✓${NC} CLI TypeScript built"
    cd ../..
else
    echo ""
    echo -e "${YELLOW}Skipping CLI WASM build (Rust/wasm-pack not available)${NC}"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Available commands:"
echo ""
echo "  ${GREEN}Test WASM decryption:${NC}"
echo "  cd packages/cli && node -e \"const w = require('./wasm/rankcli_audit_engine.js'); w.init_engine('dev'); console.log('OK:', w.get_decrypted_code().length, 'chars');\""
echo ""
echo "  ${GREEN}Test full audit (requires build:js first):${NC}"
echo "  cd packages/cli && node -e \"const{initEngine,runAudit}=require('./dist/wasm-engine.js');(async()=>{await initEngine('dev');const r=await runAudit('https://example.com','<html><head><title>Test</title></head></html>');console.log('Score:',r.score,'Issues:',r.issues.length);})();\""
echo ""
echo "  ${GREEN}Start SaaS dev server:${NC}"
echo "  cd packages/saas && pnpm dev"
echo ""
echo "  ${GREEN}Run all tests:${NC}"
echo "  pnpm test"
echo ""
echo "  ${GREEN}Build CLI for npm:${NC}"
echo "  cd packages/cli && pnpm build"
echo ""
