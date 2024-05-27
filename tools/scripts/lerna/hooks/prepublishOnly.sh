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

cached_changed_projects=$(cat "${BASE_DIR}/dist/changed-projects.txt")

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

  cat "${BASE_DIR}/packages/rxap/package.json" > "${BASE_DIR}/dist/rxap-package.json"

  yarn nx run-many \
    --target="build" \
    --configuration="production" \
    --projects="$cached_changed_projects"
fi

# exit with error if some package.json files are missing the publishConfig

# Finds all package.json files starting from the current directory and excluding those in node_modules directories.
files=$(find dist/packages -name "node_modules" -prune -o -name "package.json" -print)

hasError=false
echo "publishConfig errors:" > dist/publishConfigErrors.txt
echo "gitHead errors:" > dist/gitHeadErrors.txt

current_git_head=$(git rev-parse HEAD)

for file in $files
do
    # Checks if publishConfig or publishConfig.access is not properly set.
    access=$(jq -r '.publishConfig.access // "invalid"' $file)
    if [ "$access" != "public" ]; then
        hasError=true
        echo "publishConfig.access is not set or not equal to public in file: $file" >> dist/publishConfigErrors.txt
    fi
    gitHead=$(jq -r '.gitHead // "invalid"' $file)
    if [ "$gitHead" == "invalid" ]; then
        hasError=true
        echo "gitHead is not set in file: $file" >> dist/gitHeadErrors.txt
    fi
    if [ "$gitHead" != "$current_git_head" ]; then
        hasError=true
        echo "gitHead is not equal to the current git head in file: $file" >> dist/gitHeadErrors.txt
    fi
done

if [ "$hasError" = true ] ; then
    echo -e "${RED}ERROR! prepublishOnly.sh${NC}"
    exit 1
fi
echo -e "${GREEN}DONE! prepublishOnly.sh${NC}"
