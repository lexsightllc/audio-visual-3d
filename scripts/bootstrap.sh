#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version

pushd "$ROOT_DIR" > /dev/null
npm ci
if ! npx playwright install --with-deps; then
  echo "[bootstrap] Playwright dependency installation failed; continuing without browser provisioning." >&2
fi
node ./scripts/configure-hooks.mjs >/dev/null

git config commit.template .gitmessage
popd > /dev/null

echo "Bootstrap complete."
