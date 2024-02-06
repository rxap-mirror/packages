#!/bin/sh

corepack enable
corepack prepare yarn@3 --activate

echo "RUN: yarn --version"
yarn --version

echo "RUN: yarn config get cacheFolder"
yarn config get cacheFolder

case "$CI_COMMIT_REF_NAME" in
renovate/*)
  echo "Detected Renovate branch."
  echo "RUN: yarn"
  yarn
  ;;
snyk-*)
  echo "Detected Snyk branch."
  echo "RUN: yarn"
  yarn
  ;;
*)
  if [ "$CI_JOB_STAGE" = ".pre" ]; then
    echo "Detected .pre stage."
    echo "RUN: yarn --immutable --check-cache"
    yarn --immutable --check-cache
  else
    echo "Detected NON .pre stage."
    if [ -d node_modules ] && [ -d .yarn/cache ]; then
      echo "Detected node_modules and .yarn/cache directory."
      echo "RUN: yarn --immutable --immutable-cache"
      yarn --immutable --immutable-cache
    else
      echo "WARNING: No node_modules or .yarn/cache directory found."
      echo "RUN: yarn --immutable"
      yarn --immutable
    fi
  fi
  ;;
esac

