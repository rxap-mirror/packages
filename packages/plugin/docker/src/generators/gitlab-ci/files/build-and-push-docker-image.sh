#!/bin/sh

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOCKER_CONFIG_PATH=${DOCKER_CONFIG_PATH:-/kaniko/.docker/config.json}

if [ "$CI" = "true" ]; then
  # region install utilities
  mkdir -p /usr/local/bin
  busybox wget -O /usr/local/bin/curl https://github.com/moparisthebest/static-curl/releases/download/v7.78.0/curl-amd64
  chmod +x /usr/local/bin/curl
  busybox wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64
  chmod +x /usr/local/bin/jq
  # endregion
else
  echo -e "${RED}This script is only intended to be run in GitLab CI${NC}"
  DOCKER_CONFIG_PATH="/tmp/.docker/config.json"
  DRY_RUN="true"
fi

mkdir -p "$(dirname "${DOCKER_CONFIG_PATH}")"

echo '{ "auths": {} }' > "${DOCKER_CONFIG_PATH}"

# region general configuration
DOCKER_CONTEXT=${DOCKER_CONTEXT:-"${CI_PROJECT_DIR:-.}"}${DOCKER_CONTEXT_SUFFIX}
DOCKERFILE=${DOCKERFILE:-"${DOCKER_CONTEXT}/Dockerfile"}
KANIKO_CACHE=${KANIKO_CACHE:-true}
LATEST=${LATEST:-false}
IMAGE_TAG=${REGISTRY_IMAGE_TAG:-${VERSION:-${CI_COMMIT_TAG:-${CI_COMMIT_REF_SLUG:-latest}}}}
# Define common executor parameters
COMMON_EXEC_PARAMS="--cache=$KANIKO_CACHE --context=${DOCKER_CONTEXT} --dockerfile=${DOCKERFILE}"
DESTINATION_PARAMS=""
# endregion

PUSH_TO_GCP=${PUSH_TO_GCP:-false}
PUSH_TO_CUSTOM=${PUSH_TO_CUSTOM:-false}

# the the other push target are disabled, enable gitlab push by default not already defined
if [ "$PUSH_TO_GCP" = "false" ] && [ "$PUSH_TO_CUSTOM" = "false" ]; then
  if [ -z  $PUSH_TO_GITLAB ]; then
    PUSH_TO_GITLAB="true"
  fi
fi

PUSH_TO_GITLAB=${PUSH_TO_GITLAB:-false}

# region check gcp variables
if [ "$PUSH_TO_GCP" = "true" ]; then

  echo -e "${BLUE}Test if all variables are set for pushing to GCP${NC}"

  if [ -z  $GCP_PROJECT ]; then
    echo "GCP_PROJECT is not set"
    PUSH_TO_GCP="false"
  fi

  if [ -z  $IMAGE_NAME ]; then
    echo "IMAGE_NAME is not set"
    PUSH_TO_GCP="false"
  fi

  if [ "$PUSH_TO_GCP" = "true" ]; then
    echo -e "${GREEN}All variables are set for pushing to GCP${NC}"
  else
    echo -e "${RED}Not all variables are set for pushing to GCP${NC}"
  fi

fi
# endregion

# region check gitlab variables
if [ "$PUSH_TO_GITLAB" = "true" ]; then

  echo -e "${BLUE}Test if all variables are set for pushing to gitlab${NC}"

  if [ -z  $CI_REGISTRY_USER ]; then
    echo "CI_REGISTRY_USER is not set"
    PUSH_TO_GITLAB="false"
  fi

  if [ -z  $CI_REGISTRY_PASSWORD ]; then
    echo "CI_REGISTRY_PASSWORD is not set"
    PUSH_TO_GITLAB="false"
  fi

  if [ -z  $CI_REGISTRY ]; then
    echo "CI_REGISTRY is not set"
    PUSH_TO_GITLAB="false"
  fi

  if [ -z  $CI_REGISTRY_IMAGE ]; then
    echo "CI_REGISTRY_IMAGE is not set"
    PUSH_TO_GITLAB="false"
  fi

  if [ "$PUSH_TO_GITLAB" = "true" ]; then
    echo -e "${GREEN}All variables are set for pushing to gitlab${NC}"
  else
    echo -e "${RED}Not all variables are set for pushing to gitlab${NC}"
  fi

fi
# endregion

# region check custom registry variables
if [ "$PUSH_TO_CUSTOM" = "true" ]; then

  echo -e "${BLUE}Test if all variables are set for pushing to custom registry${NC}"

  if [ -z  $REGISTRY_USER ]; then
    echo "REGISTRY_USER is not set"
    PUSH_TO_CUSTOM="false"
  fi

  if [ -z  $REGISTRY_PASSWORD ]; then
    echo "REGISTRY_PASSWORD is not set"
    PUSH_TO_CUSTOM="false"
  fi

  if [ -z  $REGISTRY ]; then
    echo "REGISTRY is not set"
    PUSH_TO_CUSTOM="false"
  fi

  if [ -z  $IMAGE_NAME ]; then
    echo "IMAGE_NAME is not set"
    PUSH_TO_CUSTOM="false"
  fi

  if [ "$PUSH_TO_CUSTOM" = "true" ]; then
    echo -e "${GREEN}All variables are set for pushing to custom registry${NC}"
  else
    echo -e "${RED}Not all variables are set for pushing to custom registry${NC}"
  fi

fi
# endregion

# if no registry is set to push to, exit
if [ "$PUSH_TO_GCP" = "false" ] && [ "$PUSH_TO_GITLAB" = "false" ] && [ "$PUSH_TO_CUSTOM" = "false" ]; then
  echo -e "${RED}No registry is set to push to${NC}"
  exit 1
fi

# region prepare gcp push
if [ "$PUSH_TO_GCP" = "true" ]; then

  if [ "$DRY_RUN" = "true" ]; then
    AUTH="dry-run"
  else
    # region create gcp registry auth config
    echo "service account: $(curl "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email" -H "Metadata-Flavor: Google")"
    PASSWORD=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" -H "Metadata-Flavor: Google" | jq -r '.access_token')
    AUTH_RAW="oauth2accesstoken:${PASSWORD}"
    AUTH=$(echo $AUTH_RAW | busybox base64 -w 0)
    # endregion
  fi

  GCP_REGION=${GCP_REGION:-europe-west1}
  GCP_REGISTRY=${GCP_REGISTRY:-"${GCP_REGION}-docker.pkg.dev"}

  cat "${DOCKER_CONFIG_PATH}" | jq \
  --arg auth "$AUTH" \
  --arg registry "$GCP_REGISTRY" \
  '.auths["$registry"] = { "auth": $auth }' > "${DOCKER_CONFIG_PATH}"

  GCP_REGISTRY_IMAGE=${GCP_REGISTRY}/${GCP_PROJECT}/${IMAGE_NAME}
  GCP_DESTINATION="${GCP_REGISTRY_IMAGE}${IMAGE_SUFFIX}"

  DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${GCP_DESTINATION}:${IMAGE_TAG}"
  if [ "$LATEST" = "true" ]; then
    DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${GCP_DESTINATION}:latest"
  fi

fi
# endregion

# region prepare gitlab push
if [ "$PUSH_TO_GITLAB" = "true" ]; then

  cat "${DOCKER_CONFIG_PATH}" | jq \
  --arg username "$CI_REGISTRY_USER" \
  --arg password "$CI_REGISTRY_PASSWORD" \
  --arg registry "$CI_REGISTRY" \
  '.auths["$registry"] = { "username": $username, "password": $password }' > "${DOCKER_CONFIG_PATH}"

  CI_DESTINATION="${CI_REGISTRY_IMAGE}${IMAGE_SUFFIX}"

  DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${CI_DESTINATION}:${IMAGE_TAG}"
  if [ "$LATEST" = "true" ]; then
    DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${CI_DESTINATION}:latest"
  fi

fi
# endregion

# region prepare custom registry push
if [ "$PUSH_TO_CUSTOM" = "true" ]; then

  cat "${DOCKER_CONFIG_PATH}" | jq \
  --arg username "$REGISTRY_USER" \
  --arg password "$REGISTRY_PASSWORD" \
  --arg registry "$REGISTRY" \
  '.auths["$registry"] = { "username": $username, "password": $password }' > "${DOCKER_CONFIG_PATH}"

  REGISTRY_IMAGE=${REGISTRY}/${IMAGE_NAME}

  DESTINATION="${REGISTRY_IMAGE}${IMAGE_SUFFIX}"
  DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${DESTINATION}:${IMAGE_TAG}"
  if [ "$LATEST" = "true" ]; then
    DESTINATION_PARAMS="$DESTINATION_PARAMS --destination=${DESTINATION}:latest"
  fi

fi
# endregion

if [ "$DRY_RUN" = "true" ]; then
  # Run the executor with the defined parameters
  echo "/kaniko/executor $COMMON_EXEC_PARAMS $DESTINATION_PARAMS"
else
  if [ -f "/kaniko/executor" ]; then
    # Run the executor with the defined parameters
    /kaniko/executor $COMMON_EXEC_PARAMS $DESTINATION_PARAMS
  else
    echo "executor not found"
    exit 1
  fi
fi


