#!/bin/sh
set -e

# corepack is no longer bundled with node >= 25; it activates the pnpm version of the packageManager field
command -v corepack >/dev/null 2>&1 || npm install -g corepack
corepack enable

echo "RUN: pnpm --version"
pnpm --version

# keep the store inside the project so the CI cache can pick it up
pnpm config set store-dir .pnpm-store

case "$CI_COMMIT_REF_NAME" in
renovate/*|snyk-*)
  echo "Detected dependency update branch."
  echo "RUN: pnpm install --no-frozen-lockfile"
  pnpm install --no-frozen-lockfile
  ;;
*)
  echo "RUN: pnpm install --frozen-lockfile --prefer-offline"
  pnpm install --frozen-lockfile --prefer-offline
  ;;
esac
