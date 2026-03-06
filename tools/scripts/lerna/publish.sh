#!/bin/bash

set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

source ./tools/scripts/colors.sh

# Fetch the latest data from the remote repository
git fetch

# Check if the local branch is behind the remote branch
behind=$(git rev-list HEAD...origin/$(git symbolic-ref --short HEAD) --left-right | grep '^>' | wc -l)

if [[ $behind -gt 0 ]]; then
  echo -e "${RED}Local branch is behind remote branch by $behind commits.${NC}"
  exit 1
else
  echo -e "${GREEN}Local branch is up-to-date with remote branch.${NC}"
fi

if git diff --quiet && git diff --cached --quiet; then
  echo "No changes detected."
else
  echo "Changes detected."
  exit 1
fi

rm -fr "${BASE_DIR}/dist/lerna"
mkdir -p "${BASE_DIR}/dist/lerna"

PUBLISH_MODE="auto"

for arg in "$@"; do
  if [[ $arg == "from-package" ]]; then
    echo -e "${BLUE}Script was called with from-package${NC}"
    PUBLISH_MODE="from-package"
  fi
  if [[ $arg == "from-git" ]]; then
    echo -e "${BLUE}Script was called with from-git${NC}"
    PUBLISH_MODE="from-git"
  fi
done

echo "$PUBLISH_MODE" > "${BASE_DIR}/dist/lerna/publish-mode.txt"
export PUBLISH_MODE

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

export LERNA_PRE_RELEASE

if [[ "$YES" != "true" ]]; then

  read -r -p "Are you sure? [y/N] " response

  if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]; then
    exit 0
  fi

fi

if [[ -z "$GL_TOKEN" ]]; then
  echo "GL_TOKEN is not set"
  exit 1
fi

set -e

LERNA_LOG_LEVEL=${LERNA_LOG_LEVEL:-"verbose"}

if [[ "$LERNA_PRE_RELEASE" == "true" ]]; then

  if [[ -z "$LERNA_PRE_ID" ]]; then
    echo "LERNA_PRE_RELEASE=true but LERNA_PRE_ID is not defined!"
    exit 1
  fi

  echo "Executing lerna publish for pre-release..."

  echo "yarn lerna publish --create-release gitlab --conventional-prerelease --dist-tag $LERNA_DIST_TAG --registry $PUBLISH_REGISTRY --preid $LERNA_PRE_ID --loglevel $LERNA_LOG_LEVEL --no-push $@"

  yarn lerna publish \
  --create-release gitlab \
  --conventional-prerelease \
  --dist-tag "$LERNA_DIST_TAG" \
  --registry "$PUBLISH_REGISTRY" \
  --preid "$LERNA_PRE_ID" \
  --loglevel "$LERNA_LOG_LEVEL" \
  --no-push "$@"

fi

if [[ "$LERNA_PRE_RELEASE" == "false" ]]; then

  echo "Executing lerna publish for release..."

  echo "yarn lerna publish --create-release gitlab --conventional-graduate --dist-tag $LERNA_DIST_TAG --registry $PUBLISH_REGISTRY --loglevel $LERNA_LOG_LEVEL  $@"

  yarn lerna publish \
  --create-release gitlab \
  --conventional-graduate \
  --registry "$PUBLISH_REGISTRY" \
  --loglevel "$LERNA_LOG_LEVEL" \
  --dist-tag "$LERNA_DIST_TAG" "$@"

fi

if [[ "$PUBLISH_MODE" == "auto" ]]; then
  bash "${BASE_DIR}/tools/scripts/lerna/update-rxap-package-group.sh"
  RXAP_ENTRY_PUBLISH="true"
  echo "$RXAP_ENTRY_PUBLISH" > "${BASE_DIR}/dist/lerna/rxap-entry-publish.txt"
  export RXAP_ENTRY_PUBLISH

  if [[ "$LERNA_PRE_RELEASE" == "true" ]]; then

    echo "Executing lerna publish for pre-release..."

    yarn lerna publish \
    --create-release gitlab \
    --conventional-prerelease \
    --dist-tag "$LERNA_DIST_TAG" \
    --registry "$PUBLISH_REGISTRY" \
    --preid "$LERNA_PRE_ID" \
    --no-push \
    --loglevel "$LERNA_LOG_LEVEL" \
    --yes

  fi

  if [[ "$LERNA_PRE_RELEASE" == "false" ]]; then

    echo "Executing lerna publish for release..."

    yarn lerna publish \
    --create-release gitlab \
    --conventional-graduate \
    --registry "$PUBLISH_REGISTRY" \
    --dist-tag "$LERNA_DIST_TAG" \
    --loglevel "$LERNA_LOG_LEVEL" \
    --yes

  fi

fi
