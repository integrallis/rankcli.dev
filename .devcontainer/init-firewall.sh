#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "========================================"
echo "  Initializing Firewall for Autonomous Mode"
echo "========================================"
echo ""

# 1. Extract Docker DNS info BEFORE any flushing
DOCKER_DNS_RULES=$(iptables-save -t nat | grep "127\.0\.0\.11" || true)

# Flush existing rules and delete existing ipsets
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
ipset destroy allowed-domains 2>/dev/null || true

# 2. Restore Docker DNS resolution
if [ -n "$DOCKER_DNS_RULES" ]; then
  echo "Restoring Docker DNS rules..."
  iptables -t nat -N DOCKER_OUTPUT 2>/dev/null || true
  iptables -t nat -N DOCKER_POSTROUTING 2>/dev/null || true
  echo "$DOCKER_DNS_RULES" | xargs -L 1 iptables -t nat
else
  echo "No Docker DNS rules to restore"
fi

# Allow DNS and localhost first
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p udp --sport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Create ipset with CIDR support
ipset create allowed-domains hash:net

# Fetch GitHub IP ranges
echo "Fetching GitHub IP ranges..."
gh_ranges=$(curl -s https://api.github.com/meta)
if [ -z "$gh_ranges" ]; then
  echo "ERROR: Failed to fetch GitHub IP ranges"
  exit 1
fi

if ! echo "$gh_ranges" | jq -e '.web and .api and .git' >/dev/null; then
  echo "ERROR: GitHub API response missing required fields"
  exit 1
fi

echo "Processing GitHub IPs..."
while read -r cidr; do
  if [[ ! "$cidr" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$ ]]; then
    echo "ERROR: Invalid CIDR range from GitHub meta: $cidr"
    exit 1
  fi
  echo "  Adding GitHub range $cidr"
  ipset add allowed-domains "$cidr"
done < <(echo "$gh_ranges" | jq -r '(.web + .api + .git)[]' | aggregate -q)

# Allowed domains for SEO Autopilot development
ALLOWED_DOMAINS=(
  # Package registries
  "registry.npmjs.org"
  "pypi.org"
  "files.pythonhosted.org"
  # AI APIs
  "api.anthropic.com"
  "api.openai.com"
  "openai.com"
  # Google APIs (for Search Console, etc.)
  "accounts.google.com"
  "oauth2.googleapis.com"
  "www.googleapis.com"
  "searchconsole.googleapis.com"
  "pagespeedonline.googleapis.com"
  # Bing Webmaster
  "www.bing.com"
  "ssl.bing.com"
  # SERP APIs
  "serpapi.com"
  "api.serpapi.com"
  # Schema validation
  "schema.org"
  "validator.schema.org"
  # CDNs commonly needed
  "cdn.jsdelivr.net"
  "unpkg.com"
  "cdnjs.cloudflare.com"
)

for domain in "${ALLOWED_DOMAINS[@]}"; do
  echo "Resolving $domain..."
  ips=$(dig +noall +answer A "$domain" | awk '$4 == "A" {print $5}')
  if [ -z "$ips" ]; then
    echo "  WARNING: Failed to resolve $domain - continuing anyway"
    continue
  fi

  while read -r ip; do
    if [[ ! "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
      echo "  ERROR: Invalid IP from DNS for $domain: $ip"
      continue
    fi
    echo "  Adding $ip for $domain"
    ipset add allowed-domains "$ip" 2>/dev/null || true
  done < <(echo "$ips")
done

# Get host IP from default route
HOST_IP=$(ip route | grep default | cut -d" " -f3)
if [ -z "$HOST_IP" ]; then
  echo "ERROR: Failed to detect host IP"
  exit 1
fi

HOST_NETWORK=$(echo "$HOST_IP" | sed "s/\.[0-9]*$/.0\/24/")
echo "Host network detected as: $HOST_NETWORK"

# Allow host network (for Docker services)
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT

# Set default policies to DROP
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow traffic to allowed domains
iptables -A OUTPUT -m set --match-set allowed-domains dst -j ACCEPT

# Reject all other outbound traffic
iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited

echo ""
echo "Firewall configuration complete!"
echo ""
echo "Verifying firewall rules..."

# Verify blocked
if curl --connect-timeout 5 https://example.com >/dev/null 2>&1; then
  echo "ERROR: Firewall verification failed - was able to reach https://example.com"
  exit 1
else
  echo "  PASS: Unable to reach https://example.com (as expected)"
fi

# Verify GitHub access
if ! curl --connect-timeout 5 https://api.github.com/zen >/dev/null 2>&1; then
  echo "ERROR: Firewall verification failed - unable to reach https://api.github.com"
  exit 1
else
  echo "  PASS: GitHub API accessible"
fi

# Verify Anthropic API
if ! curl --connect-timeout 5 -I https://api.anthropic.com >/dev/null 2>&1; then
  echo "WARNING: Unable to reach https://api.anthropic.com"
else
  echo "  PASS: Anthropic API accessible"
fi

echo ""
echo "========================================"
echo "  Firewall setup complete!"
echo "========================================"
echo ""
echo "Allowed services:"
echo "  - GitHub (all services)"
echo "  - npm registry"
echo "  - PyPI"
echo "  - Anthropic API"
echo "  - OpenAI API"
echo "  - Google APIs (Search Console, PageSpeed)"
echo "  - Bing Webmaster"
echo "  - SerpAPI"
echo ""
echo "All other outbound traffic is BLOCKED."
echo ""
