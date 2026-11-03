#!/usr/bin/env bash
# Creates the private beta repository, pushes the beta guide and invites the people listed in
# docs/launch/beta-invitees.txt (one GitHub login per line, # comments allowed). Idempotent:
# re-running pushes the current guide and invites only logins not yet invited.
#
#   scripts/beta-invite.sh            # everything
#   scripts/beta-invite.sh --dry-run  # say what would happen
#
# Run by the founder from a normal terminal with gh logged in as an owner of the integrallis
# organization. See docs/launch/BETA-2026-11.md.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="integrallis/rankcli-beta"
LIST="$ROOT/docs/launch/beta-invitees.txt"
KIT="$ROOT/docs/launch/beta-repo"
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
run() { if [ $DRY -eq 1 ]; then echo "would: $*"; else "$@"; fi; }

[ -f "$LIST" ] || { echo "error: $LIST is missing (one GitHub login per line)" >&2; exit 1; }
mapfile -t LOGINS < <(grep -vE '^\s*(#|$)' "$LIST" | tr -d ' \r')
echo "${#LOGINS[@]} logins in $LIST"

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  run gh repo create "$REPO" --private --description "RankCLI private beta" --disable-wiki
  run gh api -X PATCH "repos/$REPO" -f has_discussions=true -f has_issues=true >/dev/null
fi

WORK="$(mktemp -d)"
if [ $DRY -eq 0 ]; then
  git clone -q "https://github.com/$REPO.git" "$WORK"
  cp "$KIT/README.md" "$KIT/FEEDBACK.md" "$WORK/"
  git -C "$WORK" add -A
  if ! git -C "$WORK" diff --cached --quiet; then
    git -C "$WORK" commit -q -m "Beta guide"
    git -C "$WORK" push -q origin HEAD
    echo "guide pushed"
  else
    echo "guide unchanged"
  fi
  rm -rf "$WORK"
fi

existing="$(gh api "repos/$REPO/collaborators?affiliation=direct" --jq '.[].login' 2>/dev/null || true)"
pending="$(gh api "repos/$REPO/invitations" --jq '.[].invitee.login' 2>/dev/null || true)"
n=0
for login in "${LOGINS[@]}"; do
  if grep -qx "$login" <<<"$existing" || grep -qx "$login" <<<"$pending"; then
    echo "already: $login"; continue
  fi
  run gh api -X PUT "repos/$REPO/collaborators/$login" -f permission=read >/dev/null
  echo "invited: $login"; n=$((n+1))
done
echo "$n new invitations; $(wc -l <<<"$pending") pending before this run"
