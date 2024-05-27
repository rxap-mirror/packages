#!/bin/bash

# get all use package names from the package.json files
package_name=$(jq '[.dependencies, .devDependencies | keys[] | select(startswith("@angular/") or startswith("@nestjs/") or startswith("@nx/"))] + ["nx"]' package.json)

project_json_file="packages/rxap/project.json"
jq --argjson packages "$package_name" 'setpath(["targets","update-package-group","options","include"]; $packages)' $project_json_file > tmp.json
mv tmp.json $project_json_file
