#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "${GIT_ROOT}" || exit 1

find . -type d \( -name node_modules -o -name dist \) -prune -o -name package.json -print | xargs -I {} ./tools/scripts/enforce-latest-package-version.sh {}
