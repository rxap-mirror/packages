#!/bin/bash

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

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

projects=($(jq -r '.projects | .[]' "${GIT_ROOT}/workspace.json"))

for projectBasePath in "${projects[@]}"; do
  if [[ "$(jq -r '.projectType' "${GIT_ROOT}/${projectBasePath}/project.json")" == "application" ]]; then
    tags=($(jq -r '.tags | .[]' "${GIT_ROOT}/${projectBasePath}/project.json"))
    if [[ "${tags[@]}" =~ "sentry" ]]; then
      outputPath=$(jq -r '.targets.build.options.outputPath' "${GIT_ROOT}/${projectBasePath}/project.json")
      SENTRY_PROJECT=$(jq -r '.sentry.projectId' "${GIT_ROOT}/${projectBasePath}/project.json")
      if [[ "$SENTRY_PROJECT" == "null" ]]; then
        SENTRY_PROJECT=$(jq -r '.name' "${GIT_ROOT}/${projectBasePath}/project.json")
      fi
      echo -e "${BLUE}Create sentry release '${VERSION}' with project id '${SENTRY_PROJECT}' for project '$(jq -r '.name' "${GIT_ROOT}/${projectBasePath}/project.json")' with dist '${outputPath}'${NC}"
      if [[ -z "$CI" ]]; then
        echo -e "${RED}Skip sentry cli command - not in a CI environment${NC}"
      else
        export SENTRY_PROJECT
        sentry-cli releases new --finalize "$VERSION"
        sentry-cli releases set-commits --auto "$VERSION"
        sentry-cli releases files "$VERSION" upload-sourcemaps "$outputPath"
        sentry-cli releases deploys "$VERSION" new -e "$ENVIRONMENT"
      fi
      unset SENTRY_PROJECT
    fi
  fi
done

echo -e "${GREEN}DONE${NC}"
