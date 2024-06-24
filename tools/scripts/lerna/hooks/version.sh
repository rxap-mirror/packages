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

#source "${BASE_DIR}/tools/scripts/lerna/get-changed-nx-projects.sh"
#changed_projects=$(getChangedNxProjects)

# check if there are no changed projects
#if [[ -z "$changed_projects" ]]; then
#  echo "No changed projects found"
#  exit 1
#fi

#if [[ ! -f "${BASE_DIR}/dist/lerna/changed-projects.txt" ]]; then
#  echo "The list of changed projects has not been cached. Ensure the perversion hook has been run."
#  exit 1
#fi

#cached_changed_projects=$(cat "${BASE_DIR}/dist/lerna/changed-projects.txt")

#if [[ "$changed_projects" != "$cached_changed_projects" ]]; then
#  echo "The list of changed projects has changed since the perversion hook"
#  echo "preversion: ${cached_changed_projects}"
#  echo "version: ${changed_projects}"
#  exit 1
#fi

PUBLISH_MODE="auto"

if [[ -f "${BASE_DIR}/dist/lerna/publish-mode.txt"  ]]; then
  PUBLISH_MODE=$(cat "${BASE_DIR}/dist/lerna/publish-mode.txt")
fi

if [[ "$PUBLISH_MODE" == "auto" ]]; then

  echo -e "${BLUE}Run the update-dependencies and update-package-group targets${NC}"

  yarn nx reset

#  yarn nx run-many \
#    --projects="${changed_projects}" \
#    --parallel 8 \
#    --exclude="rxap" \
#    --target="update-dependencies,update-package-group"

  yarn nx affected \
    --exclude="rxap" \
    --target="update-dependencies,update-package-group"

  echo -e "${BLUE}Run the workspace:readme${NC}"
  yarn nx run workspace:readme

  echo -e "${BLUE}ensure the yarn workspace is updated and the lock file is updated${NC}"
  yarn

  echo -e "${BLUE}add changes to git${NC}"
  git add .

else

  echo -e "${YELLOW}Publish mode is '${PUBLISH_MODE}'. Skip the update-{dependencies,package-group} target${NC}"

fi

echo -e "${GREEN}DONE! version.sh${NC}"
