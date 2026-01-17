#!/bin/bash
set -e

echo "========================================"
echo "  SEO Autopilot DevContainer Setup"
echo "========================================"
echo ""

cd /workspace

# ===========================================
# Python Environment
# ===========================================
echo "Setting up Python environment..."
if [ ! -d ".venv" ]; then
    uv venv
fi

# Install Python dependencies
echo "Installing Python dependencies..."
if [ -f "pyproject.toml" ]; then
    uv sync --all-extras 2>/dev/null || echo "No pyproject.toml, installing core packages..."
fi

# Install core SEO development packages
uv pip install \
    fastapi \
    uvicorn \
    httpx \
    beautifulsoup4 \
    lxml \
    requests \
    aiohttp \
    pydantic \
    python-dotenv \
    rich \
    typer \
    click \
    anthropic \
    openai \
    supabase \
    pyyaml \
    pytest \
    pytest-asyncio \
    ipython 2>/dev/null || true

# ===========================================
# Node.js Dependencies
# ===========================================
echo "Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    pnpm install
fi

# ===========================================
# Supabase CLI
# ===========================================
echo "Installing Supabase CLI..."
npm install -g supabase 2>/dev/null || true

# ===========================================
# Claude Code CLI
# ===========================================
echo "Configuring Claude Code..."
mkdir -p ~/.claude

# Add alias for --dangerously-skip-permissions
if ! grep -q "alias claude=" ~/.zshrc 2>/dev/null; then
    echo 'alias claude="claude --dangerously-skip-permissions"' >> ~/.zshrc
fi
if ! grep -q "alias claude=" ~/.bashrc 2>/dev/null; then
    echo 'alias claude="claude --dangerously-skip-permissions"' >> ~/.bashrc
fi

# ===========================================
# Project Directories
# ===========================================
echo "Creating project directories..."
mkdir -p packages/cli/src/commands
mkdir -p packages/agent-runtime/src/tools
mkdir -p packages/core/src
mkdir -p references/open-source-tools
mkdir -p data

# ===========================================
# Git Configuration
# ===========================================
git config --global --add safe.directory /workspace
git config --global init.defaultBranch main

# ===========================================
# Verify Setup
# ===========================================
echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Environment:"
echo "  - Python: $(python3 --version 2>/dev/null || echo 'not found')"
echo "  - Node.js: $(node --version 2>/dev/null || echo 'not found')"
echo "  - pnpm: $(pnpm --version 2>/dev/null || echo 'not found')"
echo "  - Supabase CLI: $(supabase --version 2>/dev/null || echo 'not installed')"
echo ""

# Check Supabase connection from .env
if [ -n "$VITE_SUPABASE_URL" ]; then
    echo "Supabase:"
    echo "  - URL: $VITE_SUPABASE_URL"
    echo "  - Service Key: ${SUPABASE_SERVICE_KEY:+configured}"
    echo "  - Access Token: ${SUPABASE_ACCESS_TOKEN:+configured}"
else
    echo "Supabase: Not configured (check .env)"
fi

echo ""
echo "Test Repo:"
echo "  - animerm.ai: test_repos/animerm.ai/"
echo "  - Run locally: cd test_repos/animerm.ai/ui && docker compose up"
echo "  - URL: http://localhost:9000 (local) or https://animerm.ai (prod)"
echo ""
echo "Commands:"
echo "  claude              # Claude with full permissions"
echo "  pnpm cli            # Run CLI commands"
echo "  supabase db push    # Push migrations to Supabase"
echo ""
echo "Ready! Say 'go' to start building."
echo ""
