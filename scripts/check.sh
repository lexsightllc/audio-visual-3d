#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

run() {
  "$SCRIPT_DIR/$1" "${@:2}"
}

run lint.sh
run typecheck.sh
run fmt.sh --check
run test.sh
run e2e.sh
run coverage.sh
run security-scan.sh
