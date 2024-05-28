#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# Finds all package.json files starting from the current directory and excluding those in node_modules directories.
files=$(find dist/packages -name "node_modules" -prune -o -name "package.json" -print)

for file in $files
do
    # Checks if publishConfig or publishConfig.access is not properly set.
    access=$(jq -r '.publishConfig.access // "invalid"' $file)
    if [ "$access" != "public" ]; then
        echo "publishConfig.access is not set or not equal to public in file: $file"
    fi
done
