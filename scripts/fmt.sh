#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

MODE="write"
for arg in "$@"; do
  if [[ "$arg" == "--check" ]]; then
    MODE="check"
  elif [[ "$arg" == "--fix" ]]; then
    MODE="write"
  fi
done

ensure_node_version
pushd "$ROOT_DIR" > /dev/null
if [[ "$MODE" == "check" ]]; then
  npm run format:check
else
  npm run format
fi
popd > /dev/null
