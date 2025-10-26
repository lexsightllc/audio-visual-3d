#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
export ROOT_DIR

run_npm() {
  pushd "$ROOT_DIR" > /dev/null
  npm "$@"
  popd > /dev/null
}

ensure_node_version() {
  local required
  if [[ -f "$ROOT_DIR/.nvmrc" ]]; then
    required=$(cat "$ROOT_DIR/.nvmrc")
    echo "Using Node.js version ${required} (set via .nvmrc)" >&2
  fi
}
