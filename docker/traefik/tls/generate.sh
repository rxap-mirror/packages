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

cd "${GIT_ROOT}/docker/traefik/tls"

echo -n "subjectAltName=DNS:127-0-0-1.nip.io" > ext.cnf.template

echo -n "," >> ext.cnf.template

echo -n "$(grep -oP 'Host\(`([^`]+)`\)' "$GIT_ROOT/docker-compose.services.yml" | sed -E 's/Host\(`([^`]+)`\)/\1/' | sort | uniq | awk '{print "DNS:" $0}' | paste -s -d,)" \
  >> ext.cnf.template

echo -n "," >> ext.cnf.template

echo -n "$(grep -oP 'Host\(`([^`]+)`\)' "$GIT_ROOT/docker-compose.yml" | sed -E 's/Host\(`([^`]+)`\)/\1/' | sort | uniq | awk '{print "DNS:" $0}' | paste -s -d,)" \
  >> ext.cnf.template

echo -n "," >> ext.cnf.template

echo -n "$(grep -oP 'Host\(`([^`]+)`\)' "$GIT_ROOT/docker-compose.frontends.yml" | sed -E 's/Host\(`([^`]+)`\)/\1/' | sort | uniq | awk '{print "DNS:" $0}' | paste -s -d,)" \
  >> ext.cnf.template

sed -i 's/,,/,/g' ext.cnf.template

if [ ! -f ca.crt ]; then

  echo "======  Generate CA certificate  ======"

  # 1. Generate CA's private key and self-signed certificate
  openssl req \
    -x509 \
    -nodes \
    -newkey rsa:4096 \
    -days 3650 \
    -keyout ca.key \
    -out ca.crt \
    -subj "/C=DE/ST=NRW/L=Aachen/O=DigitAIX/OU=rxap/CN=${ROOT_DOMAIN}"

fi

echo "======  Generate server certificate  ======"

rm default.key default.csr || true

# 2. Generate web server's private key and certificate signing request (CSR)
openssl req \
  -newkey rsa:4096 \
  -nodes \
  -keyout default.key \
  -out default.csr \
  -subj "/C=DE/ST=NRW/L=Aachen/O=DigitAIX/OU=rxap/CN=*.${ROOT_DOMAIN}"

echo "======  Sign server certificate  ======"

rm ext.cnf || true

envsubst < ext.cnf.template > ext.cnf

rm default.crt || true

# 3. Use CA's private key to sign web server's CSR and get back the signed certificate
openssl x509 \
  -req \
  -in default.csr \
  -days 365 \
  -CA ca.crt \
  -CAkey ca.key \
  -CAcreateserial \
  -out default.crt \
  -extfile ext.cnf

echo "======  Server's signed certificate  ======"
openssl x509 -in default.crt -noout -text

echo "======  Verify server certificate  ======"

openssl verify -CAfile ca.crt default.crt

