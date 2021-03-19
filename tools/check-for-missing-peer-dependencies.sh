#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

readarray -d '' array < <(find "${BASE_DIR}/dist/libs" -name package.json -print0)

for i in "${array[@]}"
do
    echo $i
    jq  '.dependencies | keys | .[] | select(.|test("@."))' "$i"
done
