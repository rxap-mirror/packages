#!/bin/sh
set -e

command -v bun >/dev/null 2>&1 || npm install -g bun

echo "RUN: bun --version"
bun --version

export BUN_INSTALL_CACHE_DIR="$PWD/.bun-cache"

case "$CI_COMMIT_REF_NAME" in
renovate/*|snyk-*)
  echo "Detected dependency update branch."
  echo "RUN: bun install"
  bun install
  ;;
*)
  echo "RUN: bun install --frozen-lockfile"
  bun install --frozen-lockfile
  ;;
esac
