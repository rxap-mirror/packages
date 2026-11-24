#!/bin/bash

pnpm install

GIT_ROOT=$(git rev-parse --show-toplevel)

bash "${GIT_ROOT}/tools/setup-env-file.sh"
