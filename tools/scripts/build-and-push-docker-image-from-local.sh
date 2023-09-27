#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

echo -e "${BLUE}Build all projects${NC}"

nx run-many --target build --configuration production

echo -e "${BLUE}Generate nx graph${NC}"

json_file="$(mktemp).json"

nx graph --file $json_file

# Ensure that a file name is passed as argument
if [[ -z "$json_file" ]]; then
    echo "Please provide the JSON file as an argument."
    exit 1
fi

# Check if the file exists
if [[ ! -f "$json_file" ]]; then
    echo "File $1 does not exist."
    exit 1
fi

# Extract keys and loop over them
keys=$(jq -r '.graph.nodes | to_entries[] | select(.value.data.targets.docker) | .key' "$json_file")

# Get the current branch name or the commit hash if in detached HEAD state
current_branch=$(git symbolic-ref --short -q HEAD || git rev-parse --short HEAD)

imageTag=${current_branch//\//-}

for key in $keys; do
    echo "Matching key: $key"
    imageName=$(jq -r --arg project "$key" '.graph.nodes[$project].data.targets.docker.options.imageName' "$json_file")
    imageSuffix=$(jq -r --arg project "$key" '.graph.nodes[$project].data.targets.docker.options.imageSuffix' "$json_file")
    dockerContext=$(jq -r --arg project "$key" '.graph.nodes[$project].data.targets.build.options.outputPath' "$json_file")
    dockerfile=$(jq -r --arg project "$key" '.graph.nodes[$project].data.targets.build.options.dockerfile' "$json_file")
    isAngular=$(jq -r 'select(.graph.nodes.dashboard.data.tags? // empty | .[] == "angular")' "$json_file")
    if [[ -z "$dockerfile" ]]; then
      echo -e "${RED}The target options does not have the dockerfile option.${NC}"
      PUSH_TO_CUSTOM=true \
      IMAGE_NAME="$imageName" \
      IMAGE_SUFFIX="$imageSuffix" \
      DOCKER_CONTEXT="$dockerContext" \
      IMAGE_TAG="$IMAGE_TAG" \
      DRY_RUN=true \
      DOCKER_BUILD_AND_PUSH_DEBUG=true \
      ./tools/scripts/build-and-push-docker-image.sh
    else
      echo -e "${GREEN}The target options does have the dockerfile option.${NC}"
      PUSH_TO_CUSTOM=true \
  IMAGE_NAME="$imageName" \
  IMAGE_SUFFIX="$imageSuffix" \
  DOCKER_CONTEXT="$dockerContext" \
  IMAGE_TAG="$IMAGE_TAG" \
  DOCKERFILE="$dockerfile" \
  DRY_RUN=true \
  DOCKER_BUILD_AND_PUSH_DEBUG=true \
  ./tools/scripts/build-and-push-docker-image.sh
    fi
done
