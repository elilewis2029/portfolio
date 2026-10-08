#!/usr/bin/env bash
# Creates the two Ely Tool drafts (unpublished) and removes the placeholder draft.
# Photos come from the handoff artifact's img/ files, saved to .intake/ely-tool/ (gitignored).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
D=docs/drafts/ely-tool
I=.intake/ely-tool
# Cloud sessions reach Supabase through an HTTPS proxy, which Node's fetch ignores unless told (Node >= 22.21).
if [ -n "${HTTPS_PROXY:-}" ]; then
  export NODE_USE_ENV_PROXY=1 NODE_NO_WARNINGS=1
  [ -f /root/.ccr/ca-bundle.crt ] && export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
fi
P() { npm run -s portfolio -- "$@"; }

P list
P new $D/shop-relayout.json $I/layout-main-floor-final.webp $I/layout-main-floor-original.webp $I/layout-eye-level-original.webp \
  $I/layout-eye-level-final.webp $I/back-room-before.jpg $I/back-room-after.jpg $I/plastics-corner-before.jpg $I/flammables-cabinet-after.jpg
P new $D/detail-room.json $I/mockup-lookup.webp $I/layout-detail-room-original.webp $I/layout-detail-room-final.webp $I/mockup-scan-link.png $I/mockup-storage-map.webp
P show todo-ely-tool-fixture >/dev/null 2>&1 && P delete todo-ely-tool-fixture || echo "no placeholder draft to delete"
P list
