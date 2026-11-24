#!/bin/sh
set -e

echo "RUN: npm --version"
npm --version

case "$CI_COMMIT_REF_NAME" in
renovate/*|snyk-*)
  echo "Detected dependency update branch."
  echo "RUN: npm install --cache .npm --prefer-offline"
  npm install --cache .npm --prefer-offline
  ;;
*)
  echo "RUN: npm ci --cache .npm --prefer-offline"
  npm ci --cache .npm --prefer-offline
  ;;
esac
