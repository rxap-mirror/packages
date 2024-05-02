#!/bin/bash

# exit when any command fails
set -e

GIT_ROOT=${CI_PROJECT_DIR:-$(git rev-parse --show-toplevel)}

cd "${GIT_ROOT}" || exit 1

export VERSION=${VERSION:-${CI_COMMIT_TAG:-$(sentry-cli releases propose-version)}}
echo "VERSION=${VERSION}"

ENVIRONMENT="development"

if echo $VERSION | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+-[^.]+\.[0-9]+$'; then
  ENVIRONMENT=$(echo $VERSION | cut -d'-' -f2 | cut -d'.' -f1)
fi

if echo $VERSION | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
  ENVIRONMENT="production"
fi

echo "ENVIRONMENT=$ENVIRONMENT"

BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
LIGHT_GRAY='\033[0;37m'
GRAY='\033[0;90m'
LIGHT_RED='\033[0;91m'
LIGHT_GREEN='\033[0;92m'
LIGHT_YELLOW='\033[0;93m'
LIGHT_BLUE='\033[0;94m'
LIGHT_MAGENTA='\033[0;95m'
LIGHT_CYAN='\033[0;96m'
WHITE='\033[0;97m'
NC='\033[0m'  # No Color

projects=($(jq -r '.projects | .[]' "${GIT_ROOT}/workspace.json"))

echo -e "${CYAN}Projects: ${projects[@]}${NC}"

for projectBasePath in "${projects[@]}"; do
  echo -e "${BLUE}Project: ${projectBasePath}${NC}"
  if [[ "$(jq -r '.projectType' "${GIT_ROOT}/${projectBasePath}/project.json")" == "application" ]]; then
    tags=($(jq -r '.tags | .[]' "${GIT_ROOT}/${projectBasePath}/project.json"))
    echo -e "${GRAY}Tags: ${tags[@]}${NC}"
    if [[ "${tags[@]}" =~ "sentry" ]]; then
      outputPath=$(jq -r '.targets.build.options.outputPath' "${GIT_ROOT}/${projectBasePath}/project.json")
      SENTRY_PROJECT=$(jq -r '.sentry.projectId' "${GIT_ROOT}/${projectBasePath}/project.json")
      if [[ "$SENTRY_PROJECT" == "null" ]]; then
        SENTRY_PROJECT=$(jq -r '.name' "${GIT_ROOT}/${projectBasePath}/project.json")
      fi
      echo -e "${BLUE}Create sentry release '${VERSION}' with project id '${SENTRY_PROJECT}' for project '$(jq -r '.name' "${GIT_ROOT}/${projectBasePath}/project.json")' with dist '${outputPath}'${NC}"
      if [[ -z "$CI" ]]; then
        echo -e "${YELLOW}Skip sentry cli command - not in a CI environment${NC}"
      else
        export SENTRY_PROJECT
        echo -e "${GRAY}SENTRY_PROJECT=${SENTRY_PROJECT}${NC}"
        echo -e "${GRAY}sentry-cli releases new --finalize ${VERSION}${NC}"
        sentry-cli releases new --finalize "$VERSION"
        echo -e "${GRAY}sentry-cli releases set-commits --auto ${VERSION}${NC}"
        sentry-cli releases set-commits --auto "$VERSION"
        echo -e "${GRAY}sentry-cli releases files ${VERSION} upload-sourcemaps ${outputPath}${NC}"
        sentry-cli releases files "$VERSION" upload-sourcemaps "$outputPath"
        echo -e "${GRAY}sentry-cli releases deploys ${VERSION} new -e ${ENVIRONMENT}${NC}"
        sentry-cli releases deploys "$VERSION" new -e "$ENVIRONMENT"
      fi
      unset SENTRY_PROJECT
    else
      echo -e "${YELLOW}Skip project - no sentry tag${NC}"
    fi
  else
    echo -e "${YELLOW}Skip project - not an application${NC}"
  fi
done

echo -e "${GREEN}DONE${NC}"
