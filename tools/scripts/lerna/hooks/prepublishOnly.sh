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

if [ -f "${BASE_DIR}/dist/lerna/rxap-entry-publish.txt" ]; then
  echo -e "${BLUE}Rxap entry point publish${NC}"
  nx run rxap:build
  exit 0
fi

#if [ -f "${BASE_DIR}/dist/lerna/changed-projects.txt" ]; then
#  cached_changed_projects=$(cat "${BASE_DIR}/dist/lerna/changed-projects.txt")
#fi

PUBLISH_MODE="auto"

if [[ -f "${BASE_DIR}/dist/lerna/publish-mode.txt"  ]]; then
  PUBLISH_MODE=$(cat "${BASE_DIR}/dist/lerna/publish-mode.txt")
fi

if [ "$PUBLISH_MODE" != "auto" ]; then
  mkdir -p "${BASE_DIR}/dist/lerna"
  rm -fr "${BASE_DIR}/dist/lerna/*.error" || true
  rm "${BASE_DIR}/dist/lerna/prepublishOnly-build.log" || true
fi

rm "${BASE_DIR}/dist/lerna/prepublishOnly.error" || true

# rm -fr "${BASE_DIR}/dist/packages"

yarn nx reset

#if [ -z "$cached_changed_projects" ]; then
  echo "No changed projects found"
  echo "yarn nx run-many --target=build --configuration=production"

  # use --skip-nx-cache to ensure the package.json is copied
  yarn nx affected \
    --target="build" \
    --exclude="angular" \
    --configuration="production" \
    --skip-nx-cache \
    --nxBail 2>&1 | tee "${BASE_DIR}/dist/lerna/prepublishOnly-build.log"
  exit_code=${PIPESTATUS[0]}
  if [ $exit_code -ne 0 ]; then
    exit $exit_code
  fi

#else
#  echo "Building changed projects: $cached_changed_projects"
#  echo "yarn nx run-many --target=build --configuration=production --projects=$cached_changed_projects"
#
#  yarn nx run-many \
#    --target="build" \
#    --configuration="production" \
#    --projects="$cached_changed_projects" \
#    --skip-nx-cache 2>&1 | tee "${BASE_DIR}/dist/lerna/prepublishOnly-build.log"
#  exit_code=${PIPESTATUS[0]}
#  if [ $exit_code -ne 0 ]; then
#    exit $exit_code
#  fi
#
#fi



# exit with error if some package.json files are missing the publishConfig

#hasError=false

#current_git_head=$(git rev-parse HEAD)

#project_list=${cached_changed_projects//,/ }
#for project in $project_list; do
#  project_root=$(yarn nx show project "$project" | jq -r '.root')
#  file="dist/$project_root/package.json"
#  gitHead=$(jq -r '.gitHead // "invalid"' "$file")
#  if [ "$gitHead" == "invalid" ]; then
#    if [ "$PUBLISH_MODE" == "auto" ]; then
#      hasError=true
#      echo "gitHead is not set in file: $file" | tee -a "${BASE_DIR}/dist/lerna/missing-gitHead.error"
#    fi
#  elif [ "$gitHead" != "$current_git_head" ]; then
#    hasError=true
#    echo "gitHead is not equal to the current git head in file: $file" | tee -a "${BASE_DIR}/dist/lerna/gitHead-mismatch.error"
#  fi
#  access=$(jq -r '.publishConfig.access // "invalid"' $file)
#  if [ "$access" != "public" ]; then
#      hasError=true
#      echo "publishConfig.access is not set or not equal to public in file: $file" | tee -a "${BASE_DIR}/dist/lerna/publish-config.error"
#  fi
#done

#if [ "$hasError" = true ] ; then
#    echo -e "${RED}ERROR! prepublishOnly.sh${NC}"
#    echo "failed" > "${BASE_DIR}/dist/lerna/prepublishOnly.error"
#    exit 1
#fi
echo -e "${GREEN}DONE! prepublishOnly.sh${NC}"
