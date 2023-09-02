#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running version.sh${NC}"

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

source "${BASE_DIR}/tools/scripts/lerna/get-changed-nx-projects.sh"
changed_projects=$(getChangedNxProjects)

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

echo -e "${BLUE}Run the update-dependencies and update-package-group targets${NC}"
yarn nx run-many \
  --projects="${changed_projects}" \
  --parallel 8 \
  --target="update-dependencies,update-package-group"

echo -e "${BLUE}Run the packages:readme${NC}"
yarn nx run packages:readme

echo -e "${BLUE}ensure the yarn workspace is updated and the lock file is updated${NC}"
yarn

echo -e "${BLUE}add changes to git${NC}"
git add .

echo -e "${GREEN}DONE! version.sh${NC}"
