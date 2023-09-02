#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running preversion.sh${NC}"

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

source "${BASE_DIR}/tools/scripts/lerna/get-changed-nx-projects.sh"
changed_projects=$(getChangedNxProjects)

# Convert commas to space
project_list=${changed_projects//,/ }

echo "changed projects:"

# Print each project on a new line with a dash in front
for project in $project_list
do
  echo "- $project"
done

read -r -p "Are you sure to start versioning? [y/N] " response

if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
  exit 1
fi

echo "${changed_projects}" > "${BASE_DIR}/dist/changed-projects.txt"

echo -e "${BLUE}Run the fix-dependencies target${NC}"
yarn nx run-many \
  --projects="$(bash tools/scripts/lerna/get-changed-nx-projects.sh)" \
  --parallel 8 \
  --target="fix-dependencies"

echo -e "${BLUE}Run build, test and lint targets${NC}"
yarn nx run-many \
  --projects="$(bash tools/scripts/lerna/get-changed-nx-projects.sh)" \
  --target="build,test,lint"

echo -e "${GREEN}DONE! preversion.sh${NC}"
