#!/bin/bash

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# Add theme entry point to package.json if a theme.css file exists in the same directory
bash tools/scripts/add-theme-entry-point-to-package-json.sh
bash tools/scripts/remove-blacklisted-package-dependenceis.sh
