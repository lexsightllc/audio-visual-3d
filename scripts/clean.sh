#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

pushd "$ROOT_DIR" > /dev/null
rm -rf dist build coverage artifacts logs reports sbom node_modules/.cache
mkdir -p artifacts logs reports sbom
popd > /dev/null
