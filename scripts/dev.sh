#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version
pushd "$ROOT_DIR" > /dev/null
npm run dev -- --host 0.0.0.0 --port "${PORT:-5173}"
popd > /dev/null
