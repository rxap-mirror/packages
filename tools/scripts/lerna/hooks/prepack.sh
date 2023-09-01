#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running prepack.sh${NC}"

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# Add theme entry point to package.json if a theme.css file exists in the same directory
echo -e "${BLUE}Adding theme entry point to package.json${NC}"
bash tools/scripts/add-theme-entry-point-to-package-json.sh
echo -e "${BLUE}Removing blacklisted package dependencies${NC}"
bash tools/scripts/remove-blacklisted-package-dependenceis.sh
echo -e "${GREEN}DONE! prepack.sh${NC}"
