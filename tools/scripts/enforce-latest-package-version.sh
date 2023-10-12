#!/bin/bash

# this script gets the current package json version and checks if this version is the latest version
# the latest version is determined by the appointed dist tag
# the digest tag is derived from the current branch name

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

GIT_ROOT=$(git rev-parse --show-toplevel)

cd "${GIT_ROOT}" || exit 1

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

if [ "$PACKAGE_NAME" == "null" ]; then
    echo -e "${RED}package.json is not valid!${NC}"
    echo "path: $FILE_PATH"
    exit 1
fi

if [ "$CURRENT_VERSION" == "null" ]; then
    echo -e "${RED}package.json is not valid!${NC}"
    echo "path: $FILE_PATH"
    exit 1
fi

echo "Checking for updates for $PACKAGE_NAME with dist tag $NPM_DIST_TAG..."

# Fetch the latest published version from npm registry
LATEST_VERSION=$(curl -s https://registry.npmjs.org/$PACKAGE_NAME | jq -r --arg dist "$NPM_DIST_TAG"  '.["dist-tags"][$dist]')

# Compare the current version with the latest published version
if [[ $CURRENT_VERSION == $LATEST_VERSION ]]; then
    echo -e "${GREEN}Your package is up to date. Current version: ${CURRENT_VERSION}${NC}"
else
    echo -e "${YELLOW}A newer version is available. Current version: $CURRENT_VERSION, Latest version: $LATEST_VERSION${NC}"

    # Update the version in package.json
    jq --arg LATEST_VERSION $LATEST_VERSION '.version = $LATEST_VERSION' $FILE_PATH > temp.json && mv temp.json $FILE_PATH
fi

