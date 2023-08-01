#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# Function to add entry to package.json
add_entry_to_package_json() {
    package_path="$1"
    jq --arg path "./theme.css" 'if .exports then .exports["./theme"]=$path else .exports = {"./theme": $path} end' "$package_path" > tmp.$$ && mv tmp.$$ "$package_path"
}

# Traverse through directories
find dist/packages/angular -type d -print | while read -r dir; do
    package="$dir/package.json"
    theme="$dir/theme.css"

    # If both package.json and theme.css exist in the same directory
    if [[ -f "$package" && -f "$theme" ]]; then
        echo "Found package.json and theme.css in directory $dir"
        add_entry_to_package_json "$package"
    fi
done
