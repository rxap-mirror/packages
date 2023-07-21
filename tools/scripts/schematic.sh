#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

externalSchematic=$1

echo "externalSchematic: $externalSchematic"

# Set the IFS variable to :
IFS=':'

# Use the read command to split the value into two variables
read -r package schematic <<< "$1"

echo "package: $package"
echo "schematic: $schematic"

# Remove the first parameter
shift

echo "arguments: $@"

# Search for package.json files in the current directory and its subdirectories
find packages -name "package.json" -type f | while read -r file; do
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
            echo "$name" > /tmp/name.txt
        else
            echo "No project.json file found in $dir"
            exit 1
        fi
    fi
done

# Read the name from the file
name=$(cat /tmp/name.txt)

if [ -z "$name" ]; then
    echo "No package found with name $package"
    exit 1
fi

yarn nx run "$name:build"

bash tools/scripts/dist-node-modules-linking.sh

# Search for package.json files in the current directory and its subdirectories
find dist/packages -name "package.json" -type f | while read -r file; do
    # Check if the name property equals to $package
    if [ "$(jq -r .name "$file")" = "$package" ]; then
        # Get the directory of the matched package.json
        dir=$(dirname "$file")

        echo "Output directory for the package: $dir"

        # If you want to use this variable outside the while loop you would need to
        # write it to a file or pass it to a command as argument here,
        # because each iteration in the loop runs in a subshell
        echo "$dir" > /tmp/dir.txt
    fi
done

# Read the dir from the file
dir=$(cat /tmp/dir.txt)

if [ -z "$dir" ]; then
    echo "No output dir for package found with name $package"
    exit 1
fi

yarn nx g "./$dir:$schematic" "$@"
