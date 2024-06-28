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

if [ -f "${GIT_ROOT}/.env" ]; then
  source "${GIT_ROOT}/.env"
fi

echo > "${GIT_ROOT}/.env"
echo "ROOT_DOMAIN=${lan_nip}" >> "${GIT_ROOT}/.env"
echo "NODE_EXTRA_CA_CERTS=${GIT_ROOT}/docker/traefik/tls/ca.crt" >> "${GIT_ROOT}/.env"
echo "HOST_IP=$(ip addr show | grep -w inet | grep -v 127.0.0.1 | grep -v 172. | awk '{print $2}' | cut -d/ -f1 | head -n 1)" >> "${GIT_ROOT}/.env"
echo "ROOT_DOMAIN_PORT=8443" >> "${GIT_ROOT}/.env"
echo "LOG_LEVEL=verbose" >> "${GIT_ROOT}/.env"

echo "OAUTH2_PROXY_COOKIE_SECRET=$(pwgen -s 32 1)" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_EMAIL_DOMAINS=*" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_PROVIDER=gitlab" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_REDIRECT_URL=http://localhost:4200/oauth2/callback" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_SCOPE=\"read_user openid profile email\"" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_OIDC_ISSUER_URL=https://gitlab.com" >> "${GIT_ROOT}/.env"
echo "OAUTH2_PROXY_CODE_CHALLENGE_METHOD=S256" >> "${GIT_ROOT}/.env"
echo "AUTH_HEADER=x-auth-request-access-token" >> "${GIT_ROOT}/.env"
echo "JWT_AUTH=false" >> "${GIT_ROOT}/.env"
