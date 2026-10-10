#!/usr/bin/env bash
# Dependency-ordered AI review of the packages/ projects.
#
#   tools/scripts/review.sh --tags angular,library [--dry-run] [--run-tests] [--write-tests] [--teams]
#
# See tools/scripts/review/review.mjs for all flags.

set -euo pipefail

for bin in node claude git; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "✗ required command '$bin' not found in PATH" >&2
    exit 1
  fi
done

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "$ROOT"
exec node tools/scripts/review/review.mjs "$@"
