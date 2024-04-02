#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

source "${GIT_ROOT}/tools/scripts/colors.sh"

cd "${GIT_ROOT}" || exit 1

source .env

# Default docker config file path
DOCKER_CONFIG="${2:-$HOME/.docker/config.json}"

# Check if docker-registry argument is provided, else use REGISTRY environment variable
if [[ -n "$1" ]]; then
  DOCKER_REGISTRY="$1"
elif [[ -n "$REGISTRY" ]]; then
  DOCKER_REGISTRY="$REGISTRY"
else
  echo "Error: Docker registry is not specified, and REGISTRY environment variable is not set."
  exit 1
fi

if [[ ! -f "$DOCKER_CONFIG" ]]; then
  echo -e "${RED}Error: Docker config file does not exist: $DOCKER_CONFIG${NC}"
  echo -e "${BLUE}Login to the docker registry ${DOCKER_REGISTRY} with username and password${NC}"
  exit 1
fi

# Function to check if authenticated with docker registry
check_authentication() {
  local registry=$1
  local config_file=$2

  # Check if the config file exists
  if [[ ! -f "$config_file" ]]; then
    echo "Docker config file does not exist: $config_file"
    exit 1
  fi

  # Attempt to find the registry in the Docker config file
  if grep -q "$registry" "$config_file"; then
    echo "Authenticated with Docker registry: $registry"
  else
    echo "Not authenticated with Docker registry: $registry"
  fi
}

# Call the function with provided arguments
check_authentication "$DOCKER_REGISTRY" "$DOCKER_CONFIG"
