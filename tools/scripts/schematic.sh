#!/bin/bash

CURRENT_DIR=$(pwd)

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "Script is located in: $SCRIPT_DIR"

cd "$SCRIPT_DIR" || exit 1

BASE_DIR=$(git rev-parse --show-toplevel)

echo "BASE_DIR: $BASE_DIR"

cd "$BASE_DIR" || exit 1

rm /tmp/name.txt || false

# This script will exit on the first error
set -e

externalSchematic=$1

echo "externalSchematic: $externalSchematic"

# Set the IFS variable to :
IFS=':'

# Use the read command to split the value into two variables
read -r package schematic <<<"$1"

echo "package: $package"
echo "schematic: $schematic"

# Remove the first parameter
shift

echo "arguments: $@"

# Search for package.json files in the current directory and its subdirectories
find . \( -type d \( -name node_modules -o -name dist -o -name .angular -o -name .nx \) \) -prune -o -name "package.json" -type f | while read -r file; do
  # Check if the name property equals to $package
  if [ "$(jq -r .name "$file")" = "$package" ]; then
    # Get the directory of the matched package.json
    dir=$(dirname "$file")

    # Read the name property from the project.json file in the same directory
    if [ -f "$dir/project.json" ]; then
      name=$(jq -r .name "$dir/project.json")

      # Print out the name for verification
      echo "Name from project.json: $name"

      # If you want to use this variable outside the while loop you would need to
      # write it to a file or pass it to a command as argument here,
      # because each iteration in the loop runs in a subshell
      echo "$name" >/tmp/name.txt
    else
      echo "No project.json file found in $dir"
      exit 1
    fi
  fi
done

# test if /tmp/name.txt exists
if [ ! -f /tmp/name.txt ]; then
  echo "No package found with name $package"
  exit 1
fi

# Read the name from the file
name=$(cat /tmp/name.txt)

if [ -z "$name" ]; then
  echo "No package found with name $package"
  exit 1
fi

startTimestamp=$(date +%s)

echo "Build project $name"

yarn nx run "$name:linking"

echo "Build time: $(($(date +%s) - startTimestamp))s"

# will be done by the target linking of the project including all dependencies
# bash tools/scripts/dist-node-modules-linking.sh

# Search for package.json files in the current directory and its subdirectories
find dist -type d -name node_modules -prune -o -name "package.json" -type f | while read -r file; do
  # Check if the name property equals to $package
  if [ "$(jq -r .name "$file")" = "$package" ]; then
    # Get the directory of the matched package.json
    dir=$(dirname "$file")

    echo "Output directory for the package: $dir"

    # If you want to use this variable outside the while loop you would need to
    # write it to a file or pass it to a command as argument here,
    # because each iteration in the loop runs in a subshell
    echo "$dir" >/tmp/dir.txt
  fi
done

echo "detect $package in $dir"

# Read the dir from the file
dir=$(cat /tmp/dir.txt)

if [ -z "$dir" ]; then
  echo "No output dir for package found with name $package"
  exit 1
fi

rel_dir=$(realpath --relative-to="$CURRENT_DIR" "$dir")

echo "relative dir: $rel_dir"
echo "schematic: $schematic"
echo "current dir: $CURRENT_DIR"

yarn --cwd "$CURRENT_DIR" nx g "./$rel_dir:$schematic" "$@"

#cd "$CURRENT_DIR" || exit 1
#
#bash "$SCRIPT_DIR/format.sh"
