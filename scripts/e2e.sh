#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

ensure_node_version
pushd "$ROOT_DIR" > /dev/null
npm run build >/dev/null
npm run preview -- --host 127.0.0.1 --port "${PORT:-5173}" &
PREVIEW_PID=$!
trap 'kill $PREVIEW_PID >/dev/null 2>&1 || true' EXIT
sleep 2
npm run test:e2e
kill $PREVIEW_PID >/dev/null 2>&1 || true
trap - EXIT
popd > /dev/null
