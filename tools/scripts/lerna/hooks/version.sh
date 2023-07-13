#!/bin/bash

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

changed_projects=$(bash tools/scripts/lerna/get-changed-nx-projects.sh)

if [[ ! -f "${BASE_DIR}/dist/changed-projects.txt" ]]; then
  echo "The list of changed projects has not been cached. Ensure the perversion hook has been run."
  exit 1
fi

cached_changed_projects=$(cat "${BASE_DIR}/dist/changed-projects.txt")

if [[ "$changed_projects" != "$cached_changed_projects" ]]; then
  echo "The list of changed projects has changed since the perversion hook"
  echo "preversion: ${cached_changed_projects}"
  echo "version: ${changed_projects}"
  exit 1
fi

yarn nx run-many \
  --projects="${changed_projects}" \
  --target="update-dependencies,update-package-group"

yarn nx run packages:readme

# ensure the yarn workspace is updated and the lock file is updated
yarn

# add changes to git
git add .
