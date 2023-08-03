#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

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
echo "REGISTRY=registry.gitlab.com/rxap/packages" >> "${GIT_ROOT}/.env"
echo "ROOT_DOMAIN_PORT=8443" >> "${GIT_ROOT}/.env"
