#!/bin/bash

# this script gets the current package json version and checks if this version is the latest version
# the latest version is determined by the appointed dist tag
# the digest tag is derived from the current branch name

GIT_ROOT=$(git rev-parse --show-toplevel)

cd "${GIT_ROOT}" || exit 1

source "./tools/scripts/semver.sh"
source "./tools/scripts/colors.sh"

# Get the current branch name or the commit hash if in detached HEAD state
current_branch=$(git symbolic-ref --short -q HEAD || git rev-parse --short HEAD)

NPM_DIST_TAG=${current_branch//\//-}

# Check if an argument is provided
if [[ -z $1 ]]; then
    echo "Usage: $0 /path/to/package.json"
    exit 1
fi

# Check if package.json exists at the provided path
if [[ ! -f $1 ]]; then
    echo "package.json file not found at the specified path!"
    exit 1
fi

FILE_PATH=$1

# Extract package name and version from package.json
PACKAGE_NAME=$(jq -r '.name' $FILE_PATH)
CURRENT_VERSION=$(jq -r '.version' $FILE_PATH)
IS_PRIVATE=$(jq -r '.private' $FILE_PATH)

if [ "$IS_PRIVATE" == "true" ]; then
    echo -e "${LIGHT_YELLOW}Your package is private. Skipping version check.${NC}"
    exit 0
fi

if [ "$PACKAGE_NAME" == "null" ]; then
    exit 0
fi

if [ "$CURRENT_VERSION" == "null" ]; then
    exit 0
fi

echo "Checking for updates for $PACKAGE_NAME with dist tag $NPM_DIST_TAG..."

# Fetch the latest published version from npm registry
LATEST_VERSION=$(curl -s https://registry.npmjs.org/$PACKAGE_NAME | jq -r --arg dist "$NPM_DIST_TAG"  '.["dist-tags"][$dist]')

if semverEQ "$CURRENT_VERSION" "$LATEST_VERSION"; then
    echo -e "${GREEN}Your package is up to date. Current version: ${CURRENT_VERSION}${NC}"
    exit 0
fi

if semverGT "$CURRENT_VERSION" "$LATEST_VERSION"; then
    echo -e "${RED}Your package version is higher than the latest published version. Current version: ${CURRENT_VERSION}, Latest version: ${LATEST_VERSION}${NC}"
fi

if semverLT "$CURRENT_VERSION" "$LATEST_VERSION"; then
    echo -e "${YELLOW}A newer version is available. Current version: $CURRENT_VERSION, Latest version: $LATEST_VERSION${NC}"
    # Update the version in package.json
    jq --arg latest_version "$LATEST_VERSION" '.version = $latest_version' $FILE_PATH > temp.json && mv temp.json $FILE_PATH
    exit 0
fi
