#!/usr/bin/env bash

project=$1

echo Project ${project}

depProjects=$(cat dep-graph.json | jq -r --arg project ${project} '.deps | .[$project] | map(.projectName)')

echo Project dependencies ${depProjects}

for depProject in $(echo "${depProjects}" | jq -r '.[]'); do
  if [ ! -d "dist/libs/${depProject}" ]; then
    ./build-with-deps.sh ${depProject}
  fi;
done;

yarn build ${project}

