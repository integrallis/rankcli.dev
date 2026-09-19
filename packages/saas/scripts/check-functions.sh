#!/usr/bin/env bash
# Type-checks every edge function with Deno - `supabase functions deploy` bundles without
# checking, so type errors used to ship. Runs on a copy outside the workspace: inside
# packages/saas, Deno picks up package.json and node_modules and goes looking for npm
# packages the functions never use. DENO overrides the binary (e.g. DENO="npx -y deno").
set -euo pipefail
deno_bin=${DENO:-deno}
src="$(cd "$(dirname "$0")/../supabase/functions" && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp -r "$src" "$work/functions"
cd "$work/functions"

entries=()
for dir in */; do
  case "$dir" in _*) continue ;; esac
  if [ -f "${dir}index.ts" ]; then entries+=("${dir}index.ts"); fi
done
echo "Type-checking ${#entries[@]} edge functions and _shared"
$deno_bin check "${entries[@]}" _shared/*.ts
