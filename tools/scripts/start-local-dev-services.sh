#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "${GIT_ROOT}" || exit 1

yarn nx g workspace-plugin:docker-compose

# Get the current branch name or the commit hash if in detached HEAD state
current_branch=$(git symbolic-ref --short -q HEAD || git rev-parse --short HEAD)

channel=${current_branch//\//-}

echo -e "${BLUE}test if $channel is a valid channel for registry ${REGISTRY:-dev-dockerhub.eurogard.cloud}${NC}"

docker pull ${REGISTRY:-dev-dockerhub.eurogard.cloud}/m2v-frontends/service/status:$channel && VALID=true || VALID=false

if [[ $VALID == true ]]; then
  echo -e "${GREEN}channel $channel is valid${NC}"
else
  echo -e "${RED}channel $channel is not valid${NC}"

  read -p "Do you want to use the 'development' channel (y/N)? "

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    channel=development
  else
    echo "exiting"
    exit 0
  fi
fi

export CHANNEL=$channel

source .env

echo "ROOT_DOMAIN=$ROOT_DOMAIN"
echo "REMOTE_DOMAIN=$REMOTE_DOMAIN"
echo "CHANNEL=$CHANNEL"
echo "SERVICE_USER_SETTINGS_BASE_URL=$SERVICE_USER_SETTINGS_BASE_URL"
echo "SERVICE_SERVER_BASE_URL=$SERVICE_SERVER_BASE_URL"
echo "LEGACY_BASE_URL=$LEGACY_BASE_URL"
echo "HOST_IP=$HOST_IP"
echo "REGISTRY=$REGISTRY"
echo "ROOT_DOMAIN_PORT=$ROOT_DOMAIN_PORT"

read -p "Does everything look good (y/N)? "

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

docker compose stop traefik
docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.frontends.yml pull
docker compose -f docker-compose.yml -f docker-compose.services.yml -f docker-compose.frontends.yml up -d
