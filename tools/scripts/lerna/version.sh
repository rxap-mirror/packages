#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

GIT_BRANCH=$(git branch --show-current)
GIT_DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD' | cut -d':' -f2 | sed -e 's/^ *//g' -e 's/ *$//g')

LERNA_DIST_TAG=""
LERNA_PRE_ID=""

LERNA_PRE_RELEASE="null"

PRE_RELEASE_BRANCHES=("next" "next-major" "beta" "alpha")

if [[ "${PRE_RELEASE_BRANCHES[@]}" =~ "${GIT_BRANCH}" ]]; then
    LERNA_PRE_RELEASE="true"
    LERNA_DIST_TAG="${GIT_BRANCH}"
    LERNA_PRE_ID="${GIT_BRANCH}"
fi

if [[ "$GIT_BRANCH" == "master" ]]; then
  LERNA_PRE_RELEASE="false"
  LERNA_DIST_TAG="latest"
fi

if [[ "$GIT_BRANCH" =~ ^[0-9]+\.x ]]; then
  LERNA_PRE_RELEASE="false"
  LERNA_DIST_TAG="${GIT_BRANCH}"
fi

if [[ "$GIT_BRANCH" =~ ^[0-9]+\.[0-9]+\.x ]]; then
  LERNA_PRE_RELEASE="false"
  LERNA_DIST_TAG="${GIT_BRANCH}"
fi

if [[ "${GIT_BRANCH}" =~ -dev$ || "$GIT_BRANCH" == "development" ]]; then
    LERNA_PRE_RELEASE="true"
    LERNA_DIST_TAG="${GIT_BRANCH}"
    LERNA_PRE_ID="dev"
fi

echo "LERNA_PRE_RELEASE=${LERNA_PRE_RELEASE}"
echo "LERNA_DIST_TAG=${LERNA_DIST_TAG}"
echo "GIT_BRANCH=${GIT_BRANCH}"
echo "GIT_DEFAULT_BRANCH=${GIT_DEFAULT_BRANCH}"
echo "LERNA_PRE_ID=${LERNA_PRE_ID}"

read -r -p "Are you sure? [y/N] " response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
  echo "Executing..."
else
  exit 1
fi

if [[ "$LERNA_PRE_RELEASE" == "true" ]]; then

  echo "Executing lerna version for pre-release..."

  yarn lerna version \
  --create-release gitlab \
  --conventional-prerelease \
  --preid "$LERNA_PRE_ID" "$@"

fi

if [[ "$LERNA_PRE_RELEASE" == "false" ]]; then

  echo "Executing lerna version for release..."

  yarn lerna version \
  --create-release gitlab \
  --conventional-graduate "$@"

fi
