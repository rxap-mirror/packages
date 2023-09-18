#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

if ! command -v pwgen &> /dev/null
then
    echo "pwgen could not be found"
    echo "Please install pwgen"
    echo "sudo apt install pwgen"
    exit
fi

lan_nip="127-0-0-1.nip.io"

source "${GIT_ROOT}/.env"

echo > "${GIT_ROOT}/.env"
echo "GL_TOKEN=${GL_TOKEN}" >> "${GIT_ROOT}/.env"
echo "GITLAB_HOST=https://gitlab.com" >> "${GIT_ROOT}/.env"
echo "REMOTE_ALIAS=origin" >> "${GIT_ROOT}/.env"
echo "ROOT_DOMAIN=${lan_nip}" >> "${GIT_ROOT}/.env"
echo "REMOTE_DOMAIN=rxap.app" >> "${GIT_ROOT}/.env"
echo "NODE_EXTRA_CA_CERTS=${GIT_ROOT}/docker/traefik/tls/ca.crt" >> "${GIT_ROOT}/.env"
echo "HOST_IP=$(ip addr show | grep -w inet | grep -v 127.0.0.1 | grep -v 172. | awk '{print $2}' | cut -d/ -f1 | head -n 1)" >> "${GIT_ROOT}/.env"
echo "REGISTRY=registry.gitlab.com" >> "${GIT_ROOT}/.env"
echo "IMAGE_NAME=rxap/packages" >> "${GIT_ROOT}/.env"
echo "ROOT_DOMAIN_PORT=8443" >> "${GIT_ROOT}/.env"
echo "LOG_LEVEL=verbose" >> "${GIT_ROOT}/.env"
echo "PG_PASS=$(pwgen -s 40 1)" >> "${GIT_ROOT}/.env"
echo "AUTHENTIK_SECRET_KEY=$(pwgen -s 50 1)" >> "${GIT_ROOT}/.env"
echo "AUTHENTIK_ERROR_REPORTING__ENABLED=true" >> "${GIT_ROOT}/.env"
