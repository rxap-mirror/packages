#!/bin/sh

GIT_ROOT=$(git rev-parse --show-toplevel)

cd "${GIT_ROOT}" || exit 1

npx npm-check-updates --filter "/@nestjs|cache-manager|class-transformer|class-validator|cookie-parser|helmet|swagger-ui-express|csurf|express/" -u

yarn
