#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

if [ -f "${GIT_ROOT}/.env" ]; then
  while IFS='=' read -r key value; do
    if [[ ! ${key} =~ ^# ]] && [[ ${key} =~ ^[a-zA-Z_]+[a-zA-Z0-9_]*$ ]]; then
      if [ -z "${!key}" ]; then
        export "$key=$value"
      fi
    fi
  done < <(grep -v '^#' "${GIT_ROOT}/.env")
fi

if [[ -z "$ROOT_DOMAIN" ]]; then
  echo "Ensure that the environment variable >>ROOT_DOMAIN<< is defined" 1>&2
  exit 1
fi

cd "$GIT_ROOT/docker/traefik"

rm traefik.yml || true

ROOT_DOMAIN=${ROOT_DOMAIN:-127-0-0-1.nip.io}

export ROOT_DOMAIN

envsubst < traefik.yml.template > traefik.yml

bash ./tls/generate.sh
