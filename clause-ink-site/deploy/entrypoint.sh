#!/bin/sh
# Fail closed: refuse to serve anything without credentials.
# Set them once with:  fly secrets set BASIC_AUTH_USER=... BASIC_AUTH_PASS=...
set -eu

if [ -z "${BASIC_AUTH_USER:-}" ] || [ -z "${BASIC_AUTH_PASS:-}" ]; then
  echo "FATAL: BASIC_AUTH_USER / BASIC_AUTH_PASS not set — this surface is private-only." >&2
  echo "Run: fly secrets set BASIC_AUTH_USER=<user> BASIC_AUTH_PASS=<password>" >&2
  exit 1
fi

htpasswd -bc /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
exec nginx -g 'daemon off;'
