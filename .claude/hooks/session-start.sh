#!/bin/bash
# Installs dependencies in Claude Code cloud sessions so scripts, typecheck and builds work on a fresh container.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ -d node_modules ] && [ node_modules/.package-lock.json -nt package-lock.json ]; then
  echo "session-start: node_modules up to date"
  exit 0
fi

echo "session-start: installing npm dependencies"
npm install --no-audit --no-fund
echo "session-start: done"
