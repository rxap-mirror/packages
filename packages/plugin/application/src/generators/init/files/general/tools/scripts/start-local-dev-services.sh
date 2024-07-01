#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

source "${GIT_ROOT}/tools/scripts/colors.sh"

# Initialize default values for flags
local_mode="false"
skip_generate="false"
always_yes="false"
configuration="development"

# Loop through arguments and process them
while [ "$1" != "" ]; do
  case $1 in
  --local) local_mode="true" ;;
  --skip-build) skip_build="true" ;;
  --skip-generate) skip_generate="true" ;;
  --yes) always_yes="true" ;;
  --production) configuration="production" ;;
  *)
    echo "Usage: $0 --local"
    exit 1
    ;;
  esac
  shift
done

if [ "$local_mode" == "true" ]; then
  echo "Local mode activated."
  # Place your code for local mode here
else
  echo "Normal mode."
  # Place your code for normal mode here
fi

cd "${GIT_ROOT}" || exit 1

if [ ! -f .env ]; then
  echo "No .env file found. Generating one..."
  yarn init:env
fi

if [[ $skip_generate != "true" ]]; then
  yarn nx run workspace:docker-compose
fi

# Get the current branch name or the commit hash if in detached HEAD state
current_branch=$(git symbolic-ref --short -q HEAD || git rev-parse --short HEAD)

channel=${current_branch//\//-}

source .env

CHANNEL=${CHANNEL:-$channel}
BUILD_LOCAL=${BUILD_LOCAL:-$local_mode}

echo "ROOT_DOMAIN=$ROOT_DOMAIN"
echo "REMOTE_DOMAIN=$REMOTE_DOMAIN"
echo "CHANNEL=$CHANNEL"
echo "HOST_IP=$HOST_IP"
echo "REGISTRY=$REGISTRY"
echo "ROOT_DOMAIN_PORT=$ROOT_DOMAIN_PORT"
echo "SKIP_PULL=$SKIP_PULL"
echo "BUILD_LOCAL=$BUILD_LOCAL"

if [[ $always_yes != "true" ]]; then
  read -rp "Does everything look good (y/N)? "

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi


export CHANNEL

# region check if authenticated with docker

/bin/bash "${GIT_ROOT}/tools/scripts/check-docker-auth.sh" "${REGISTRY:-registry.gitlab.com}" || docker login "${REGISTRY:-registry.gitlab.com}"# endregion

LOCAL_DOCKER_COMPOSE_FILES="-f docker-compose.services.yml -f docker-compose.frontends.yml"
REMOTE_DOCKER_COMPOSE_FILES="-f docker-compose.yml"

# Append all matching override files
for file in docker-compose.*.yml; do
  if [ $file != "docker-compose.services.yml" ] && [ $file != "docker-compose.frontends.yml" ]; then
    REMOTE_DOCKER_COMPOSE_FILES="$REMOTE_DOCKER_COMPOSE_FILES -f $file"
  fi
done

DOCKER_COMPOSE_FILES="${REMOTE_DOCKER_COMPOSE_FILES} ${LOCAL_DOCKER_COMPOSE_FILES}"

docker compose $REMOTE_DOCKER_COMPOSE_FILES pull || exit 1

function build {

  echo "Building images locally"

  echo "docker compose $DOCKER_COMPOSE_FILES down"
  docker compose $DOCKER_COMPOSE_FILES down

  local PARAMS="--target docker --configuration $configuration --tag $channel"
  if [[ $REGISTRY != "" ]]; then
    PARAMS="$PARAMS --imageRegistry $REGISTRY"
  fi
  echo "yarn nx run-many $PARAMS"
  # don't use double quotes around $PARAMS here. or else the $PARAMS will be expanded and passed as a single argument
  yarn nx run-many $PARAMS

}

if [[ $BUILD_LOCAL == "true" ]]; then

  if [[ $skip_build != "true"  ]]; then
    build
  fi

else

  if [[ $SKIP_PULL != "true" ]]; then

    if docker compose $DOCKER_COMPOSE_FILES pull; then
      echo -e "${GREEN}channel $channel is valid${NC}"
    else
      echo -e "${RED}channel $channel is not valid${NC}"

      read -rp "Do you want to try to build the images locally (y/N)? "

      if [[ $REPLY =~ ^[Yy]$ ]]; then
        build
      else
        echo "exiting"
        exit 1
      fi

    fi

  fi

fi

docker compose stop traefik || true
docker compose $DOCKER_COMPOSE_FILES up -d --remove-orphans
