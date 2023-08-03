#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

GIT_BRANCH=${GIT_BRANCH:-$(git branch --show-current)}
GIT_DEFAULT_BRANCH=${GIT_DEFAULT_BRANCH:-$(git remote show origin | grep 'HEAD' | cut -d':' -f2 | sed -e 's/^ *//g' -e 's/ *$//g')}

LERNA_DIST_TAG=""
LERNA_PRE_ID=""

LERNA_PRE_RELEASE="null"

PRE_RELEASE_BRANCHES=("next" "next-major" "beta" "alpha")

if [[ "${PRE_RELEASE_BRANCHES[@]}" =~ "${GIT_BRANCH}" ]]; then
    LERNA_PRE_RELEASE="true"
    LERNA_DIST_TAG="${GIT_BRANCH}"
    LERNA_PRE_ID="${GIT_BRANCH}"
fi

if [[ "$GIT_BRANCH" == "$GIT_DEFAULT_BRANCH" || "$GIT_BRANCH" == "latest" ]]; then
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

PUBLISH_REGISTRY=${PUBLISH_REGISTRY:-"https://registry.npmjs.org"}

echo "LERNA_PRE_RELEASE=${LERNA_PRE_RELEASE}"
echo "LERNA_DIST_TAG=${LERNA_DIST_TAG}"
echo "GIT_BRANCH=${GIT_BRANCH}"
echo "GIT_DEFAULT_BRANCH=${GIT_DEFAULT_BRANCH}"
echo "LERNA_PRE_ID=${LERNA_PRE_ID}"
echo "PUBLISH_REGISTRY=${PUBLISH_REGISTRY}"

read -r -p "Are you sure? [y/N] " response

if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
  exit 1
fi

if [[ -z "$GL_TOKEN" ]]; then
  echo "GL_TOKEN is not set"
  exit 1
fi

if [[ "$LERNA_PRE_RELEASE" == "true" ]]; then

  if [[ -z "$LERNA_PRE_ID" ]]; then
    echo "LERNA_PRE_RELEASE=true but LERNA_PRE_ID is not defined!"
    exit 1
  fi

  echo "Executing lerna publish for pre-release..."

  echo "yarn lerna publish --create-release gitlab --conventional-prerelease --dist-tag $LERNA_DIST_TAG --registry $PUBLISH_REGISTRY --preid $LERNA_PRE_ID $@"

  yarn lerna publish \
  --create-release gitlab \
  --conventional-prerelease \
  --dist-tag "$LERNA_DIST_TAG" \
  --registry "$PUBLISH_REGISTRY" \
  --preid "$LERNA_PRE_ID" \
  --no-push "$@"

fi

if [[ "$LERNA_PRE_RELEASE" == "false" ]]; then

  echo "Executing lerna publish for release..."

  echo "yarn lerna publish --create-release gitlab --conventional-graduate --dist-tag $LERNA_DIST_TAG --registry $PUBLISH_REGISTRY $@"

  yarn lerna publish \
  --create-release gitlab \
  --conventional-graduate \
  --registry "$PUBLISH_REGISTRY" \
  --dist-tag "$LERNA_DIST_TAG" \
  --no-push "$@"

fi
