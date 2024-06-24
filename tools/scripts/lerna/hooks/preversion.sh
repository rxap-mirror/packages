#!/bin/bash

echo -e "${BLUE}Running preversion.sh${NC}"

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

#source "${BASE_DIR}/tools/scripts/lerna/get-changed-nx-projects.sh"
source "${BASE_DIR}/tools/scripts/colors.sh"
#changed_projects=$(getChangedNxProjects)

# Convert commas to space
#project_list=${changed_projects//,/ }

echo "changed projects:"

# check if there are no changed projects
#if [[ -z "$changed_projects" ]]; then
#  echo "No changed projects found"
#  exit 1
#fi

# Print each project on a new line with a dash in front
#for project in $project_list; do
#  echo "- $project"
#done

#if [[ "$YES" != "true" ]]; then
#
#  read -r -p "Are you sure to start versioning? [y/N] " response
#
#  if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
#    exit 0
#  fi
#
#fi

#echo "${changed_projects}" > "${BASE_DIR}/dist/lerna/changed-projects.txt"

PUBLISH_MODE="auto"

if [[ -f "${BASE_DIR}/dist/lerna/publish-mode.txt"  ]]; then
  PUBLISH_MODE=$(cat "${BASE_DIR}/dist/lerna/publish-mode.txt")
fi

if [[ "$PUBLISH_MODE" == "auto" ]]; then

  echo -e "${BLUE}Run the fix-dependencies target${NC}"

  yarn nx reset

#  yarn nx run-many \
#    --projects="${changed_projects}" \
#    --parallel 8 \
#    --target="fix-dependencies"

  yarn nx run-many \
    --target="fix-dependencies"

  echo -e "${BLUE}add changes to git${NC}"
  git add .

else

  echo -e "${YELLOW}Publish mode is '${PUBLISH_MODE}'. Skip the fix-dependencies target${NC}"

fi

echo -e "${BLUE}Run build, test and lint targets${NC}"

yarn nx reset

#yarn nx run-many \
#  --projects="${changed_projects}" \
#  --target="build,test,lint"

yarn nx run-many \
  --exclude="angular" \
  --target="build,test,lint"

echo -e "${GREEN}DONE! preversion.sh${NC}"
