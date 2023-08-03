#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# Function to add entry to package.json
remove_dependency() {
  file="$1"
  dependency="$2"

  if [[ -f "$file" ]]; then
    jq "del(.dependencies[\"$dependency\"])" "$file" > temp.json && mv temp.json "$file"
    jq "del(.peerDependencies[\"$dependency\"])" "$file" > temp.json && mv temp.json "$file"
    jq "del(.devDependencies[\"$dependency\"])" "$file" > temp.json && mv temp.json "$file"
  else
    echo "File $file does not exist."
  fi
}

# Iterate over package.json files
for file in $(find dist/packages -name 'package.json'); do
  remove_dependency "$file" "workspace"
done
