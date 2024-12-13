#!/bin/bash

# Declare an array to hold unique targets
declare -a ARRAY

ARRAY=("a")
# Recursively find all project.json files
find . -type f -name "project.json" | while read -r file; do
  # Use jq to extract the keys from the "targets" object
  if targets=$(jq -r '.targets | keys[]?' "$file" 2>/dev/null); then
    # Add each target to the associative array
    for target in $targets; do
      echo "$target"
    done
  fi
done

