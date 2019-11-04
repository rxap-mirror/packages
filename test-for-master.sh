#!/usr/bin/env bash

CI_NODE_INDEX=${CI_NODE_INDEX:-0}

index=$(echo "${CI_NODE_INDEX}-1" | bc)

project=$(cat nx.json | jq -r --arg index ${index} '.projects | to_entries[$index | tonumber] | .key')

yarn test ${project}

