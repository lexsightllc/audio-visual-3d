#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version
pushd "$ROOT_DIR" > /dev/null
if [[ -d "server/migrations" ]]; then
  npm run migrate -- "$@"
else
  echo "No migrations directory found. Skipping." >&2
fi
popd > /dev/null
