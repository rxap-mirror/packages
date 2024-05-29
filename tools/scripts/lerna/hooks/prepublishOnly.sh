#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running prepublishOnly.sh${NC}"

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

cached_changed_projects=$(cat "${BASE_DIR}/dist/lerna/changed-projects.txt")

rm -fr "${BASE_DIR}/dist/packages"

if [ -z "$cached_changed_projects" ]; then
  echo "No changed projects found"
#  echo "yarn nx run-many --target=build --configuration=production"

#  yarn nx run-many \
#    --target="build" \
#    --configuration="production"
  exit 1
else
  echo "Building changed projects: $cached_changed_projects"
  echo "yarn nx run-many --target=build --configuration=production --projects=$cached_changed_projects"

  yarn nx reset

  yarn nx run-many \
    --target="build" \
    --configuration="production" \
    --projects="$cached_changed_projects" \
    --skip-nx-cache | tee "${BASE_DIR}/dist/lerna/prepublishOnly-build.log"
fi

# exit with error if some package.json files are missing the publishConfig

hasError=false
echo "publishConfig errors:" > dist/publishConfigErrors.txt
echo "gitHead errors:" > dist/gitHeadErrors.txt

current_git_head=$(git rev-parse HEAD)

PUBLISH_MODE="auto"

if [[ -f "./dist/publish-mode.txt"  ]]; then
  PUBLISH_MODE=$(cat "./dist/publish-mode.txt")
fi

project_list=${cached_changed_projects//,/ }
for project in $project_list; do
  project_root=$(yarn nx show project "$project" | jq -r '.root')
  file="dist/$project_root/package.json"
  gitHead=$(jq -r '.gitHead // "invalid"' "$file")
  if [ "$gitHead" == "invalid" ]; then
    if [ "$PUBLISH_MODE" == "auto" ]; then
      hasError=true
      echo "gitHead is not set in file: $file" >> dist/gitHeadErrors.txt
    fi
  elif [ "$gitHead" != "$current_git_head" ]; then
    hasError=true
    echo "gitHead is not equal to the current git head in file: $file" >> dist/gitHeadErrors.txt
  fi
  access=$(jq -r '.publishConfig.access // "invalid"' $file)
  if [ "$access" != "public" ]; then
      hasError=true
      echo "publishConfig.access is not set or not equal to public in file: $file" >> dist/publishConfigErrors.txt
  fi
done

if [ "$hasError" = true ] ; then
    echo -e "${RED}ERROR! prepublishOnly.sh${NC}"
    exit 1
fi
echo -e "${GREEN}DONE! prepublishOnly.sh${NC}"
