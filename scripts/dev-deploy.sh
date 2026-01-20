#!/bin/bash
# =============================================================================
# RankCLI Development Deployment Script
# =============================================================================
# This script sets up the development environment by:
# 1. Checking for required environment variables
# 2. Linking to Supabase project
# 3. Running database migrations
# 4. Deploying Edge Functions
# 5. Starting the development server
#
# Usage: ./scripts/dev-deploy.sh [--skip-functions] [--skip-migrations]
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
START_SERVER=true

for arg in "$@"; do
  case $arg in
    --skip-functions)
      SKIP_FUNCTIONS=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    --no-server)
      START_SERVER=false
      shift
      ;;
    *)
      ;;
  esac
done

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   RankCLI Development Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# =============================================================================
# Step 1: Check for required environment variables
# =============================================================================
echo -e "${YELLOW}Step 1: Checking environment variables...${NC}"

# Load .env file if it exists
if [ -f ".env" ]; then
  export $(cat .env | grep -v '^#' | xargs)
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

# Use npx to run supabase (installs if needed)
SUPABASE_CMD="npx supabase"

echo -e "${GREEN}✓ Using npx supabase${NC}"
$SUPABASE_CMD --version

# =============================================================================
# Step 3: Link Supabase project
# =============================================================================
echo ""
echo -e "${YELLOW}Step 3: Linking Supabase project...${NC}"

cd packages/saas

# Check if already linked
if [ -f "supabase/.temp/project-ref" ]; then
  LINKED_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")
  if [ "$LINKED_REF" = "$PROJECT_REF" ]; then
    echo -e "${GREEN}✓ Already linked to project $PROJECT_REF${NC}"
  else
    echo "  Relinking to $PROJECT_REF..."
    $SUPABASE_CMD link --project-ref $PROJECT_REF
    echo -e "${GREEN}✓ Linked to project $PROJECT_REF${NC}"
  fi
else
  $SUPABASE_CMD link --project-ref $PROJECT_REF
  echo -e "${GREEN}✓ Linked to project $PROJECT_REF${NC}"
fi

# =============================================================================
# Step 4: Run database migrations
# =============================================================================
if [ "$SKIP_MIGRATIONS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 4: Running database migrations...${NC}"

  $SUPABASE_CMD db push

  echo -e "${GREEN}✓ Database migrations applied${NC}"
else
  echo ""
  echo -e "${YELLOW}Step 4: Skipping database migrations (--skip-migrations)${NC}"
fi

# =============================================================================
# Step 5: Deploy Edge Functions
# =============================================================================
if [ "$SKIP_FUNCTIONS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 5: Deploying Edge Functions...${NC}"

  # Set secrets for Edge Functions
  echo "  Setting function secrets..."

  SECRETS_TO_SET=""

  if [ -n "$STRIPE_SECRET_KEY" ]; then
    SECRETS_TO_SET="$SECRETS_TO_SET STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
  fi

  if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    SECRETS_TO_SET="$SECRETS_TO_SET STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"
  fi

  if [ -n "$OPENAI_API_KEY" ]; then
    SECRETS_TO_SET="$SECRETS_TO_SET OPENAI_API_KEY=$OPENAI_API_KEY"
  fi

  if [ -n "$SECRETS_TO_SET" ]; then
    $SUPABASE_CMD secrets set $SECRETS_TO_SET 2>/dev/null || true
    echo -e "${GREEN}  ✓ Secrets set${NC}"
  fi

  # Deploy functions (--use-api bundles server-side, avoids Docker mount issues)
  FUNCTIONS=(
    "create-checkout"
    "stripe-webhook"
    "create-portal"
    "run-audit"
    "free-audit"
  )

  for func in "${FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
      echo "  Deploying $func..."
      $SUPABASE_CMD functions deploy $func --no-verify-jwt --use-api 2>&1 | grep -v "^$" || true
    fi
  done

  echo -e "${GREEN}✓ Edge Functions deployed${NC}"
else
  echo ""
  echo -e "${YELLOW}Step 5: Skipping Edge Functions deployment (--skip-functions)${NC}"
fi

# =============================================================================
# Step 6: Install dependencies (from monorepo root)
# =============================================================================
echo ""
echo -e "${YELLOW}Step 6: Installing dependencies...${NC}"

cd ../..  # Back to monorepo root

if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  npm ci 2>/dev/null || npm install
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# =============================================================================
# Step 7: Start development server
# =============================================================================
if [ "$START_SERVER" = true ]; then
  echo ""
  echo -e "${YELLOW}Step 7: Starting development server...${NC}"
  echo ""
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}   Development environment is ready!${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo -e "  Frontend:  ${BLUE}http://localhost:3000${NC}"
  echo -e "  Supabase:  ${BLUE}$VITE_SUPABASE_URL${NC}"
  echo ""
  echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop the server"
  echo ""

  cd packages/saas
  pnpm run dev
else
  echo ""
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}   Development environment is ready!${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo -e "  To start the server: ${BLUE}cd packages/saas && pnpm run dev${NC}"
  echo -e "  Frontend will be at: ${BLUE}http://localhost:3000${NC}"
  echo ""
fi
