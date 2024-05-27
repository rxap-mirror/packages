#!/bin/bash

# exit on error
set -e

# get the list of workspace packages as json array
echo "List of workspace packages:"
projects=$(yarn nx show projects --json)
echo $projects | jq

# remove the items "workspace" and "workspace-tools" and "angular" from the json array
echo "Remove the items 'workspace' and 'workspace-tools' and 'angular' from the list of workspace packages:"
projects=$(echo $projects | jq 'map(select(. != "workspace"))')
projects=$(echo $projects | jq 'map(select(. != "workspace-tools"))')
projects=$(echo $projects | jq 'map(select(. != "angular"))')

# set the property implicitDependencies of the package.json to the list of workspace packages
echo "Set the property implicitDependencies of the package.json to the list of workspace packages:"
project_json_file="packages/rxap/project.json"
jq ". + {\"implicitDependencies\": $projects}" $project_json_file > tmp.json
mv tmp.json $project_json_file
