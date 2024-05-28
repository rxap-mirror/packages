#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "${GIT_ROOT}" || exit 1

# Start with the base file
params="-f docker-compose.yml"

# Append all matching override files
for file in docker-compose.*.yml; do
    params="$params -f $file"
done

docker compose $params down
