#!/bin/sh

# List of packages to be installed
packages="git g++ make python3 curl"
missing_packages=""

# Iterate through the list of packages and check if they are installed
for package in $packages; do
  if ! apk info | grep -q "^$package$"; then
    missing_packages="$missing_packages $package"
  fi
done

# If there are any missing packages, install them
if [ -n "$missing_packages" ]; then
  echo "Installing missing packages: $missing_packages"
  apk add --no-cache "$missing_packages"
else
  echo "All packages are already installed"
fi

corepack enable
corepack prepare yarn@stable --activate

case "$CI_COMMIT_REF_NAME" in
renovate/*)
  yarn --refresh-lockfile
  ;;
*)
  if [ -d node_modules ] && [ -d .yarn/cache ]; then
    if [ "$CI_JOB_STAGE" = ".pre" ]; then
      yarn --immutable --immutable-cache
    else
      # without --immutable-cache, yarn will try to update the cache
      yarn --immutable
    fi
  else
    echo "WARNING: No node_modules or .yarn/cache directory found."
    yarn
  fi
  ;;
esac
