#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

echo "BASE_DIR: $BASE_DIR"

cd "$BASE_DIR" || exit 1

# Get a list of modified files that are tracked by Git
MODIFIED_FILES=$(git diff --name-only HEAD | grep '\.\(ts\|html\|json\|yaml\)$')

# Print the amount of modified files
echo "Found $(echo "$MODIFIED_FILES" | wc -l) modified files"

FORMATTER_PATH=$(which webstorm)

# Format each TypeScript file
for file in $MODIFIED_FILES; do
  $FORMATTER_PATH format -r "$file"
done

echo "Done formatting files"
