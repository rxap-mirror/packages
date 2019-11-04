#!/usr/bin/env bash

CI_NODE_INDEX=${CI_NODE_INDEX:-${1:-1}}

index=$(echo "${CI_NODE_INDEX}-1" | bc)

echo "Index ${index}"

project=$(cat angular.json | jq -r --arg index ${index} '[.projects | to_entries[] | select(.value.projectType | contains("library")) | .value.root][$index | tonumber]')

echo "Project ${project}"

yarn madge -c --no-spinner --ts-config "${project}/tsconfig.lib.json" "${project}/src/index.ts"
