#!/usr/bin/env bash

packages=$(find dist/libs -name package.json -exec cat {} + | jq -r '.name + "/" + .version')

for package in $packages; do
  noFound=$(curl -s https://npm.digitaix.dev/${package} | jq '.error?')
  if [ "${noFound}" != "null" ]
  then
  echo -e "\e[91mPackage ${package} is out-to-date\e[39m"
    name=$(echo $package | cut -d '/' -f 2)
    yarn --cwd dist/libs/${name} publish --non-interactive
  else
    echo -e "\e[96mPackage ${package} is up-to-date\e[39m"
  fi
done;

