#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version

pushd "$ROOT_DIR" > /dev/null
npm ci
npx playwright install --with-deps
npm exec husky install >/dev/null

git config commit.template .gitmessage
popd > /dev/null

echo "Bootstrap complete."
