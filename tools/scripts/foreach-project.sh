#!/bin/bash

# Script to execute a command for each project.json found.

# Function to extract the "name" property from a JSON file
extract_name() {
  local json_file="$1"

  # Use jq to extract the "name" property
  name=$(jq -r '.name' "$json_file" 2>/dev/null)

  # Check if jq returned an error or the property doesn't exist
  if [[ -z "$name" ]]; then
    echo "Error: Could not extract 'name' from $json_file" >&2 # Print error to stderr
    return 1 # Indicate failure
  fi

  echo "$name"
}

# Function to execute the command for a given project
execute_command() {
  local json_file="$1"
  local command="$2"
  local additional_args="$3" # Capture additional arguments

  local name=$(extract_name "$json_file")
  if [[ -z "$name" ]]; then
      return 1 # Skip if name extraction failed.
  fi

  # Construct the full command to execute
  local full_command="yarn nx g $command --project \"$name\" $additional_args"  #Quote project name to prevent problems with spaces.

  echo "Executing: $full_command"
  eval "$full_command"

  if [[ $? -ne 0 ]]; then
    echo "Error executing command for project '$name' (from $json_file)" >&2
    return 1 # Indicate failure if the command itself failed
  fi

  return 0 #Indicate success
}

# Function to recursively search for project.json files and execute the command
process_project_json() {
  local command="$1"
  shift # Remove the command from the argument list

  local additional_args="$*" # Capture all remaining arguments

  find . -name "project.json" \
    -not -path "./node_modules/*" \
    -not -path "./docs/*" \
    -not -path "./.*/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/docs/*" \
    -not -path "*/.*/*" | while read -r json_file; do
      execute_command "$json_file" "$command" "$additional_args"
    done
}

# --- Main Script ---

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <command> [options]"
  exit 1
fi

command="$1"
shift  #Remove the first argument

process_project_json "$command" "$@"
