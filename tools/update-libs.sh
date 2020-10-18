#!/bin/bash

packages=$(cat angular.json | jq -r '.projects | to_entries[] | select(.value.projectType == "library") | .key')

for package in $packages; do
  # nx workspace-schematic idea-run-config "$package"
  nx workspace-schematic package-script "$package"
done;
