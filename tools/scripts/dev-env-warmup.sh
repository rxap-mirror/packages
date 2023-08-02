#!/bin/bash

yarn

GIT_ROOT=$(git rev-parse --show-toplevel)

bash "${GIT_ROOT}/tools/setup-env-file.sh"
