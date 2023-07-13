#!/bin/bash

# This script will exit on the first error
set -e

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

rm -fr "${BASE_DIR}/dist/packages"

yarn nx run-many \
  --target="build" \
  --configuration="production"
