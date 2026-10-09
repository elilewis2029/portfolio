#!/bin/bash
# Cloud sessions: install dependencies and point the session at the same Supabase project production uses.
set -euo pipefail

# Run in any cloud container: web sessions set CLAUDE_CODE_REMOTE, desktop-app sessions in the same
# environment do not, but both carry VERCEL_TOKEN. Eli's own machine has neither, so it skips this.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ] && [ -z "${VERCEL_TOKEN:-}" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ -d node_modules ] && [ node_modules/.package-lock.json -nt package-lock.json ]; then
  echo "session-start: node_modules up to date"
else
  echo "session-start: installing npm dependencies"
  npm install --no-audit --no-fund
fi

# Vercel holds the keys the live site uses. Pull them so scripts and local builds hit the same project,
# whatever the environment's own variables say. Values go to .env.local (gitignored) and the session env.
if [ -n "${VERCEL_TOKEN:-}" ]; then
  # The CLI is not in the base image, and a fresh clone is not linked: use npx and write the link file (ids are public).
  VERCEL="vercel"; command -v vercel >/dev/null 2>&1 || VERCEL="npx --yes vercel@latest"
  if [ ! -f .vercel/project.json ]; then
    mkdir -p .vercel
    printf '{"projectId":"prj_AgnVGOUb1RKL1MYERnteMk1ERs9T","orgId":"team_O10BQQMStMey48liCw1gSFXs","projectName":"portfolio"}\n' > .vercel/project.json
  fi
  if pull_log=$($VERCEL env pull .env.local --environment=production --yes --token "$VERCEL_TOKEN" 2>&1); then
    for name in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
      value=$(grep -E "^${name}=" .env.local | head -1 | cut -d= -f2- | tr -d '"')
      if [ -n "$value" ]; then
        export "$name=$value"
        if [ -n "${CLAUDE_ENV_FILE:-}" ]; then printf 'export %s=%q\n' "$name" "$value" >> "$CLAUDE_ENV_FILE"; fi
      fi
    done
    echo "session-start: Supabase keys synced from Vercel production"
  else
    echo "session-start: WARNING: could not pull Vercel production env; scripts fall back to the environment's variables" >&2
    printf '%s\n' "$pull_log" | grep -iE 'error|not_linked|forbidden|invalid|token' | grep -v '=' | tail -3 | sed 's/^/session-start:   /' >&2 || true
  fi
else
  echo "session-start: WARNING: VERCEL_TOKEN not set; Supabase keys not synced from Vercel" >&2
fi

# Report which project the session will hit (host only; never print keys). scripts/portfolio.ts prefers .env.local.
supabase_host=$(grep -oE 'https://[a-z0-9]+\.supabase\.co' .env.local 2>/dev/null | head -1 || true)
supabase_host=${supabase_host:-$(printf '%s' "${NEXT_PUBLIC_SUPABASE_URL:-}" | grep -oE 'https://[^/]+' || true)}
echo "session-start: Supabase host in use: ${supabase_host:-none (NEXT_PUBLIC_SUPABASE_URL unset)}"
echo "session-start: done"
