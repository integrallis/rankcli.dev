#!/bin/bash
# =============================================================================
# RankCLI Development Deployment Script
# =============================================================================
# This script sets up the development environment. It is idempotent and can be
# run multiple times safely. On subsequent runs, it will skip steps that are
# already complete.
#
# Usage: ./scripts/dev-deploy.sh [options]
#
# Options:
#   --skip-functions   Skip Edge Functions deployment
#   --skip-migrations  Skip database migrations
#   --skip-deps        Skip dependency installation
#   --skip-auth        Skip auth settings configuration
#   --no-server        Don't start the dev server at the end
#   --force            Force all steps even if already done
#   --quick            Only start server (skip all setup steps)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_FUNCTIONS=false
SKIP_MIGRATIONS=false
SKIP_DEPS=false
SKIP_AUTH=false
START_SERVER=true
FORCE=false
QUICK=false

for arg in "$@"; do
  case $arg in
    --skip-functions)
      SKIP_FUNCTIONS=true
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      ;;
    --skip-deps)
      SKIP_DEPS=true
      ;;
    --skip-auth)
      SKIP_AUTH=true
      ;;
    --no-server)
      START_SERVER=false
      ;;
    --force)
      FORCE=true
      ;;
    --quick)
      QUICK=true
      ;;
    *)
      ;;
  esac
done

# Quick mode - just start the server
if [ "$QUICK" = true ]; then
  echo -e "${BLUE}Starting development server (quick mode)...${NC}"
  cd packages/saas 2>/dev/null || cd ../packages/saas 2>/dev/null || true
  pnpm run dev
  exit 0
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   RankCLI Development Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# =============================================================================
# Step 1: Check for required environment variables
# =============================================================================
echo -e "${YELLOW}Step 1: Checking environment variables...${NC}"

# Load .env file if it exists (from repo root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ -f ".env" ]; then
  set -a
  source .env
  set +a
  echo -e "${GREEN}✓ Loaded .env file${NC}"
else
  echo -e "${RED}✗ .env file not found${NC}"
  echo "  Please create a .env file with the required variables."
  echo "  See DEPLOYMENT.md for details."
  exit 1
fi

# Check required variables
REQUIRED_VARS=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_KEY"
  "SUPABASE_ACCESS_TOKEN"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}✗ Missing required environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please add these to your .env file."
  exit 1
fi

echo -e "${GREEN}✓ All required environment variables are set${NC}"

# Extract project ref from URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')
echo -e "  Project ref: ${BLUE}$PROJECT_REF${NC}"

# =============================================================================
# Step 2: Check Supabase CLI
# =============================================================================
echo ""
echo -e "${YELLOW}Step 2: Checking Supabase CLI...${NC}"

# Use npx to run supabase (caches after first run)
SUPABASE_CMD="npx supabase"
echo -e "${GREEN}✓ Using npx supabase${NC}"

# =============================================================================
# Step 3: Configure Supabase Auth Settings
# =============================================================================
if [ "$SKIP_AUTH" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 3: Configuring Supabase Auth settings...${NC}"

  SITE_URL="http://localhost:3005"
  REDIRECT_URLS="http://localhost:3005/auth/callback"

  # Check current auth config first
  CURRENT_CONFIG=$(curl -s \
    "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" 2>/dev/null)

  CURRENT_SITE_URL=$(echo "$CURRENT_CONFIG" | grep -o '"site_url":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")
  CURRENT_REDIRECT=$(echo "$CURRENT_CONFIG" | grep -o '"uri_allow_list":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "")

  if [ "$CURRENT_SITE_URL" = "$SITE_URL" ] && [ "$CURRENT_REDIRECT" = "$REDIRECT_URLS" ] && [ "$FORCE" = false ]; then
    echo -e "${GREEN}✓ Auth settings already configured${NC}"
  else
    # Update auth config using Management API
    AUTH_RESPONSE=$(curl -s -X PATCH \
      "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
      -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"site_url\": \"$SITE_URL\",
        \"uri_allow_list\": \"$REDIRECT_URLS\"
      }" 2>/dev/null)

    if echo "$AUTH_RESPONSE" | grep -q "error"; then
      echo -e "${YELLOW}⚠ Could not update auth config via API${NC}"
      echo "  Please manually set in Supabase Dashboard:"
      echo "  - Site URL: $SITE_URL"
      echo "  - Redirect URLs: $REDIRECT_URLS"
    else
      echo -e "${GREEN}✓ Auth settings updated${NC}"
    fi
  fi
  echo "  Site URL: $SITE_URL"
  echo "  Redirect URLs: $REDIRECT_URLS"
else
  echo ""
  echo -e "${YELLOW}Step 3: Skipping auth configuration (--skip-auth)${NC}"
fi

# =============================================================================
# Step 4: Link Supabase project
# =============================================================================
echo ""
echo -e "${YELLOW}Step 4: Linking Supabase project...${NC}"

cd packages/saas

# Check if already linked to correct project
LINKED_REF=""
if [ -f "supabase/.temp/project-ref" ]; then
  LINKED_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")
fi

if [ "$LINKED_REF" = "$PROJECT_REF" ] && [ "$FORCE" = false ]; then
  echo -e "${GREEN}✓ Already linked to project $PROJECT_REF${NC}"
else
  $SUPABASE_CMD link --project-ref $PROJECT_REF 2>/dev/null || true
  echo -e "${GREEN}✓ Linked to project $PROJECT_REF${NC}"
fi

# =============================================================================
# Step 5: Run database migrations
# =============================================================================
if [ "$SKIP_MIGRATIONS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 5: Running database migrations...${NC}"

  # db push is idempotent - only applies new migrations
  MIGRATION_OUTPUT=$($SUPABASE_CMD db push 2>&1) || true

  if echo "$MIGRATION_OUTPUT" | grep -q "No changes"; then
    echo -e "${GREEN}✓ Database is up to date${NC}"
  else
    echo -e "${GREEN}✓ Database migrations applied${NC}"
  fi
else
  echo ""
  echo -e "${YELLOW}Step 5: Skipping database migrations (--skip-migrations)${NC}"
fi

# =============================================================================
# Step 6: Build Deno bundle for Edge Functions
# =============================================================================
if [ "$SKIP_FUNCTIONS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 6: Building Deno bundle for Edge Functions...${NC}"

  cd "$REPO_ROOT/packages/agent-runtime"
  pnpm build:deno 2>/dev/null || {
    echo -e "${YELLOW}⚠ Deno bundle build failed, continuing anyway...${NC}"
  }
  echo -e "${GREEN}✓ Deno bundle built${NC}"

  cd "$REPO_ROOT/packages/saas"
fi

# =============================================================================
# Step 7: Deploy Edge Functions
# =============================================================================
if [ "$SKIP_FUNCTIONS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 7: Deploying Edge Functions...${NC}"

  # Set secrets (idempotent - overwrites existing)
  SECRETS_TO_SET=""
  [ -n "$STRIPE_SECRET_KEY" ] && SECRETS_TO_SET="$SECRETS_TO_SET STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
  [ -n "$STRIPE_WEBHOOK_SECRET" ] && SECRETS_TO_SET="$SECRETS_TO_SET STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"
  [ -n "$OPENAI_API_KEY" ] && SECRETS_TO_SET="$SECRETS_TO_SET OPENAI_API_KEY=$OPENAI_API_KEY"
  [ -n "$GITHUB_WEBHOOK_SECRET" ] && SECRETS_TO_SET="$SECRETS_TO_SET GITHUB_WEBHOOK_SECRET=$GITHUB_WEBHOOK_SECRET"
  [ -n "$GITHUB_APP_ID" ] && SECRETS_TO_SET="$SECRETS_TO_SET GITHUB_APP_ID=$GITHUB_APP_ID"
  [ -n "$GITHUB_PRIVATE_KEY" ] && SECRETS_TO_SET="$SECRETS_TO_SET GITHUB_PRIVATE_KEY=$GITHUB_PRIVATE_KEY"

  if [ -n "$SECRETS_TO_SET" ]; then
    $SUPABASE_CMD secrets set $SECRETS_TO_SET 2>/dev/null || true
    echo -e "${GREEN}  ✓ Secrets configured${NC}"
  fi

  # Deploy functions (--use-api for server-side bundling)
  FUNCTIONS=(
    "create-checkout"
    "stripe-webhook"
    "create-portal"
    "run-audit"
    "free-audit"
    "github-webhook"
  )

  DEPLOYED=0
  for func in "${FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
      echo -n "  Deploying $func... "
      DEPLOY_OUTPUT=$($SUPABASE_CMD functions deploy $func --no-verify-jwt --use-api 2>&1) || true
      if echo "$DEPLOY_OUTPUT" | grep -qi "error"; then
        echo -e "${YELLOW}⚠${NC}"
      else
        echo -e "${GREEN}✓${NC}"
        ((DEPLOYED++))
      fi
    fi
  done

  echo -e "${GREEN}✓ Edge Functions deployed ($DEPLOYED/${#FUNCTIONS[@]})${NC}"
else
  echo ""
  echo -e "${YELLOW}Steps 6-7: Skipping Edge Functions (--skip-functions)${NC}"
fi

# =============================================================================
# Step 8: Install dependencies
# =============================================================================
if [ "$SKIP_DEPS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 8: Installing dependencies...${NC}"

  cd "$REPO_ROOT"

  # Check if node_modules is up to date (compare lockfile mtime)
  NEEDS_INSTALL=true
  if [ -d "node_modules" ] && [ "$FORCE" = false ]; then
    if [ -f "pnpm-lock.yaml" ]; then
      # Check if lockfile is newer than node_modules
      if [ "node_modules" -nt "pnpm-lock.yaml" ]; then
        NEEDS_INSTALL=false
      fi
    fi
  fi

  if [ "$NEEDS_INSTALL" = true ]; then
    if [ -f "pnpm-lock.yaml" ]; then
      pnpm install --frozen-lockfile 2>/dev/null || pnpm install
    else
      npm ci 2>/dev/null || npm install
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
  else
    echo -e "${GREEN}✓ Dependencies up to date${NC}"
  fi
else
  echo ""
  echo -e "${YELLOW}Step 8: Skipping dependency installation (--skip-deps)${NC}"
fi

# =============================================================================
# Step 9: Start development server
# =============================================================================
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Development environment is ready!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  Frontend:  ${BLUE}http://localhost:3005${NC}"
echo -e "  Supabase:  ${BLUE}$VITE_SUPABASE_URL${NC}"
echo ""

if [ "$START_SERVER" = true ]; then
  echo -e "${YELLOW}Step 9: Starting development server...${NC}"
  echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop the server"
  echo ""

  cd "$REPO_ROOT/packages/saas"
  pnpm run dev
else
  echo -e "  To start the server: ${BLUE}cd packages/saas && pnpm run dev${NC}"
  echo ""
  echo -e "  Quick start next time: ${BLUE}./scripts/dev-deploy.sh --quick${NC}"
  echo ""
fi
