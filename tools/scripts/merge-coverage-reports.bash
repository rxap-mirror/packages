#!/bin/bash

# ensure we're in the root of the repo
BASE_DIR=$(git rev-parse --show-toplevel)
cd "$BASE_DIR" || exit 1

echo "clean up any old coverage data"
rm coverage/coverage-final.json || true

echo "collecting raw coverage files"
COVERAGE_FILES=$(find . -name "coverage-final.json" -not -path "./node_modules/*" -not -path "./.nx/*")
if [ -z "$COVERAGE_FILES" ]; then
  echo "Error: No coverage files found!"
  # use the exit code 42 to indicate that no coverage files were found
  # and to allow the ci script to detect this error and allow this failure
  exit 42 # Terminate script
else
  echo "coverage files found:"
  echo "$COVERAGE_FILES"
  echo "merging coverage files"
  echo "$COVERAGE_FILES" | xargs npx istanbul-merge --out .nyc_output/out.json
  echo "generating coverage report"
  npx nyc report --report-dir coverage --reporter html --reporter text --reporter cobertura
fi
