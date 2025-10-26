#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

MODE=""
for arg in "$@"; do
  if [[ "$arg" == "--fix" ]]; then
    MODE="--fix"
  fi
done

ensure_node_version
pushd "$ROOT_DIR" > /dev/null
if [[ -n "$MODE" ]]; then
  npm run lint:fix
else
  npm run lint
fi
popd > /dev/null
