#!/bin/sh
# Installs the workspace dependencies with the pnpm version pinned in package.json#packageManager
# (used by qodana.yaml; the GitLab CI install runs in the rxap/gitlab-ci components).

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# corepack is no longer bundled with Node >= 25
command -v corepack >/dev/null 2>&1 || npm install -g corepack
corepack enable

echo "RUN: pnpm --version"
pnpm --version

echo "RUN: pnpm store path"
pnpm store path

case "$CI_COMMIT_REF_NAME" in
renovate/* | snyk-*)
  echo "Detected a dependency update branch."
  echo "RUN: pnpm install --no-frozen-lockfile"
  pnpm install --no-frozen-lockfile
  ;;
*)
  echo "RUN: pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile
  ;;
esac
