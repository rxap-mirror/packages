#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

changed_projects=$(bash tools/scripts/lerna/get-changed-nx-projects.sh)

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

yarn nx run-many \
  --projects="$(bash tools/scripts/lerna/get-changed-nx-projects.sh)" \
  --target="fix-dependencies"

yarn nx run-many \
  --projects="$(bash tools/scripts/lerna/get-changed-nx-projects.sh)" \
  --target="build,test,lint"
