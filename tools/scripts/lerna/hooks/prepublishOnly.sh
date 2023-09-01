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

rm -fr "${BASE_DIR}/dist/packages"

yarn nx run-many \
  --target="build" \
  --configuration="production"

# exit with error if some package.json files are missing the publishConfig

# Finds all package.json files starting from the current directory and excluding those in node_modules directories.
files=$(find dist/packages -name "node_modules" -prune -o -name "package.json" -print)

hasError=false

for file in $files
do
    # Checks if publishConfig or publishConfig.access is not properly set.
    access=$(jq -r '.publishConfig.access // "invalid"' $file)
    if [ "$access" != "public" ]; then
        hasError=true
        echo "publishConfig.access is not set or not equal to public in file: $file"
    fi
done

if [ "$hasError" = true ] ; then
    echo -e "${RED}ERROR! prepublishOnly.sh${NC}"
    exit 1
fi
echo -e "${GREEN}DONE! prepublishOnly.sh${NC}"
