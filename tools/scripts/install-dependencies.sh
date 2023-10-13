#!/bin/sh

corepack enable
corepack prepare yarn@stable --activate

case "$CI_COMMIT_REF_NAME" in
renovate/*)
  echo "RUN: yarn --refresh-lockfile"
  yarn --refresh-lockfile
  ;;
*)
  if [ "$CI_JOB_STAGE" = ".pre" ]; then
    echo "RUN: yarn --immutable --check-cache"
    yarn --immutable --check-cache
  else
    if [ -d node_modules ] && [ -d .yarn/cache ]; then
      echo "RUN: yarn --immutable --immutable-cache"
      yarn --immutable --immutable-cache
    else
      echo "WARNING: No node_modules or .yarn/cache directory found."
      echo "RUN: yarn"
      yarn --immutable
    fi
  fi
  ;;
esac
