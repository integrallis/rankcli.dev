#!/usr/bin/env bash
#
# setup-cloudflare-domain.sh
# 
# Automates adding a domain to Cloudflare and configuring it for Cloudflare Pages.
# Reusable for any SaaS project.
#
# Required env vars:
#   CLOUDFLARE_API_TOKEN - API token with Zone:Edit, DNS:Edit, Pages:Edit permissions
#   CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID
#
# Usage:
#   ./scripts/setup-cloudflare-domain.sh <domain> <pages-project-name>
#
# Example:
#   ./scripts/setup-cloudflare-domain.sh rankcli.dev rankcli
#

set -euo pipefail

DOMAIN="${1:-}"
PAGES_PROJECT="${2:-}"

if [[ -z "$DOMAIN" || -z "$PAGES_PROJECT" ]]; then
  echo "Usage: $0 <domain> <pages-project-name>"
  echo "Example: $0 rankcli.dev rankcli"
  exit 1
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set"
  exit 1
fi

API="https://api.cloudflare.com/client/v4"
AUTH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

echo "🌐 Setting up $DOMAIN for Cloudflare Pages project: $PAGES_PROJECT"
echo ""

# -----------------------------------------------------------------------------
# Step 1: Check if zone already exists
# -----------------------------------------------------------------------------
echo "📋 Checking if zone exists..."
ZONE_CHECK=$(curl -s -X GET "$API/zones?name=$DOMAIN" -H "$AUTH" -H "Content-Type: application/json")
ZONE_ID=$(echo "$ZONE_CHECK" | jq -r '.result[0].id // empty')

if [[ -n "$ZONE_ID" ]]; then
  echo "✅ Zone already exists: $ZONE_ID"
else
  # Step 1b: Add the zone
  echo "➕ Adding zone to Cloudflare..."
  ZONE_RESULT=$(curl -s -X POST "$API/zones" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$DOMAIN\",\"account\":{\"id\":\"$CLOUDFLARE_ACCOUNT_ID\"},\"jump_start\":true}")
  
  if echo "$ZONE_RESULT" | jq -e '.success' > /dev/null; then
    ZONE_ID=$(echo "$ZONE_RESULT" | jq -r '.result.id')
    echo "✅ Zone created: $ZONE_ID"
  else
    echo "❌ Failed to create zone:"
    echo "$ZONE_RESULT" | jq '.errors'
    exit 1
  fi
fi

# -----------------------------------------------------------------------------
# Step 2: Get nameservers
# -----------------------------------------------------------------------------
echo ""
echo "📋 Getting Cloudflare nameservers..."
ZONE_INFO=$(curl -s -X GET "$API/zones/$ZONE_ID" -H "$AUTH" -H "Content-Type: application/json")
NS1=$(echo "$ZONE_INFO" | jq -r '.result.name_servers[0]')
NS2=$(echo "$ZONE_INFO" | jq -r '.result.name_servers[1]')

echo "✅ Nameservers:"
echo "   $NS1"
echo "   $NS2"

# -----------------------------------------------------------------------------
# Step 3: Set up DNS records for Pages
# -----------------------------------------------------------------------------
echo ""
echo "📋 Setting up DNS records..."

# Function to create or update DNS record
upsert_dns() {
  local type="$1"
  local name="$2"
  local content="$3"
  local proxied="${4:-true}"
  
  # Check if record exists
  EXISTING=$(curl -s -X GET "$API/zones/$ZONE_ID/dns_records?type=$type&name=$name" \
    -H "$AUTH" -H "Content-Type: application/json")
  RECORD_ID=$(echo "$EXISTING" | jq -r '.result[0].id // empty')
  
  if [[ -n "$RECORD_ID" ]]; then
    # Update existing
    curl -s -X PUT "$API/zones/$ZONE_ID/dns_records/$RECORD_ID" \
      -H "$AUTH" -H "Content-Type: application/json" \
      --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied}" > /dev/null
    echo "   Updated: $name → $content"
  else
    # Create new
    curl -s -X POST "$API/zones/$ZONE_ID/dns_records" \
      -H "$AUTH" -H "Content-Type: application/json" \
      --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied}" > /dev/null
    echo "   Created: $name → $content"
  fi
}

# Root domain CNAME (flattened by Cloudflare)
upsert_dns "CNAME" "$DOMAIN" "${PAGES_PROJECT}.pages.dev"

# www subdomain
upsert_dns "CNAME" "www.$DOMAIN" "${PAGES_PROJECT}.pages.dev"

echo "✅ DNS records configured"

# -----------------------------------------------------------------------------
# Step 4: Set SSL mode to Full (strict)
# -----------------------------------------------------------------------------
echo ""
echo "🔒 Setting SSL mode to Full (strict)..."
curl -s -X PATCH "$API/zones/$ZONE_ID/settings/ssl" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data '{"value":"full"}' > /dev/null
echo "✅ SSL mode set"

# -----------------------------------------------------------------------------
# Step 5: Add custom domain to Cloudflare Pages
# -----------------------------------------------------------------------------
echo ""
echo "📋 Adding custom domain to Cloudflare Pages..."

# Add root domain
PAGES_DOMAIN_RESULT=$(curl -s -X POST "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PAGES_PROJECT/domains" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data "{\"name\":\"$DOMAIN\"}")

if echo "$PAGES_DOMAIN_RESULT" | jq -e '.success' > /dev/null; then
  echo "✅ Added $DOMAIN to Pages project"
else
  ERROR_CODE=$(echo "$PAGES_DOMAIN_RESULT" | jq -r '.errors[0].code // empty')
  if [[ "$ERROR_CODE" == "8000040" ]]; then
    echo "✅ $DOMAIN already configured in Pages"
  else
    echo "⚠️  Could not add domain (may already exist or need manual verification):"
    echo "$PAGES_DOMAIN_RESULT" | jq -r '.errors[0].message // .messages[0].message // "Unknown error"'
  fi
fi

# Add www subdomain
PAGES_WWW_RESULT=$(curl -s -X POST "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PAGES_PROJECT/domains" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data "{\"name\":\"www.$DOMAIN\"}")

if echo "$PAGES_WWW_RESULT" | jq -e '.success' > /dev/null; then
  echo "✅ Added www.$DOMAIN to Pages project"
else
  ERROR_CODE=$(echo "$PAGES_WWW_RESULT" | jq -r '.errors[0].code // empty')
  if [[ "$ERROR_CODE" == "8000040" ]]; then
    echo "✅ www.$DOMAIN already configured in Pages"
  else
    echo "⚠️  Could not add www subdomain (may already exist)"
  fi
fi

# -----------------------------------------------------------------------------
# Step 6: Update DNSimple nameservers (if credentials provided)
# -----------------------------------------------------------------------------
if [[ -n "${DNSIMPLE_TOKEN:-}" && -n "${DNSIMPLE_ACCOUNT_ID:-}" ]]; then
  echo ""
  echo "📋 Updating nameservers at DNSimple..."
  
  NS_RESULT=$(curl -s -X PUT "https://api.dnsimple.com/v2/$DNSIMPLE_ACCOUNT_ID/registrar/domains/$DOMAIN/delegation" \
    -H "Authorization: Bearer $DNSIMPLE_TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "[\"$NS1\",\"$NS2\"]")
  
  if echo "$NS_RESULT" | jq -e '.data' > /dev/null 2>&1; then
    echo "✅ Nameservers updated at DNSimple"
    DNSIMPLE_UPDATED=true
  else
    echo "⚠️  Failed to update nameservers:"
    echo "$NS_RESULT" | jq -r '.message // "Unknown error"'
    DNSIMPLE_UPDATED=false
  fi
else
  DNSIMPLE_UPDATED=false
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ CLOUDFLARE SETUP COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

if [[ "$DNSIMPLE_UPDATED" == "true" ]]; then
  echo "✅ Nameservers automatically updated at DNSimple!"
  echo ""
  echo "   Nameservers set to:"
  echo "   ┌─────────────────────────────────────┐"
  echo "   │  $NS1  │"
  echo "   │  $NS2  │"
  echo "   └─────────────────────────────────────┘"
else
  echo "📋 Next step: Update nameservers at your registrar"
  echo ""
  echo "   Current registrar: $(host -t NS $DOMAIN 2>/dev/null | head -1 | awk '{print $NF}' || echo 'unknown')"
  echo ""
  echo "   Change nameservers to:"
  echo "   ┌─────────────────────────────────────┐"
  echo "   │  $NS1  │"
  echo "   │  $NS2  │"
  echo "   └─────────────────────────────────────┘"
fi

echo ""
echo "   After nameserver propagation (5-30 min), your site will be live at:"
echo "   → https://$DOMAIN"
echo "   → https://www.$DOMAIN"
echo ""
