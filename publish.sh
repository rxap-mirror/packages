#!/usr/bin/env bash

packages=$(find dist/libs -name package.json -exec cat {} + | jq -r '.name')

for package in $packages; do
  name=$(echo $package | cut -d '/' -f 2)
  yarn --cwd dist/libs/${name} publish --access public --non-interactive
done;

