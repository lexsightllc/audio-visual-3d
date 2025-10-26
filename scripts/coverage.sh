#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version

if ! node -e "require.resolve('@vitest/coverage-v8')" >/dev/null 2>&1; then
  echo "[coverage] @vitest/coverage-v8 not available; skipping coverage generation." >&2
  exit 0
fi

pushd "$ROOT_DIR" > /dev/null
npm run coverage
popd > /dev/null
