#!/usr/bin/env bash
# ship.sh — one command: ./ship.sh
# Creates the fly app if needed, sets the preview password if none exists,
# deploys, prints the live URL. Run from this folder on a machine with `fly` logged in.
set -euo pipefail

APP="clause-ink"

# app (idempotent)
fly apps create "$APP" 2>/dev/null || true

# the site is password-gated (private preview). Generate credentials once.
if ! fly secrets list -a "$APP" 2>/dev/null | grep -q BASIC_AUTH_USER; then
  PASS="$(openssl rand -base64 15 | tr -dc 'a-zA-Z0-9' | cut -c1-16)"
  fly secrets set BASIC_AUTH_USER=tobi BASIC_AUTH_PASS="$PASS" -a "$APP" --stage
  echo ""
  echo "  ── preview login (save this) ─────────────"
  echo "     user: tobi"
  echo "     pass: $PASS"
  echo "  ──────────────────────────────────────────"
  echo ""
fi

fly deploy -a "$APP"

echo ""
echo "Live: https://clause-ink.fly.dev/drop"
echo "(To make it public later: remove the auth_basic lines in deploy/nginx.conf"
echo " and the guard in deploy/entrypoint.sh, then ./ship.sh again.)"
