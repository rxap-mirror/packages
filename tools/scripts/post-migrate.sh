#!/bin/bash

CURRENT_ANGULAR_VERSION=$(jq -r '.dependencies["@angular/core"]' package.json)
CURRENT_ANGULAR_MAJOR_VERSION=$(echo "$CURRENT_ANGULAR_VERSION" | cut -d. -f1)

CURRENT_NESTJS_VERSION=$(jq -r '.dependencies["@nestjs/core"]' package.json)
CURRENT_NESTJS_MAJOR_VERSION=$(echo "$CURRENT_NESTJS_VERSION" | cut -d. -f1)

CURRENT_NX_VERSION=$(jq -r '.devDependencies["nx"]' package.json)
CURRENT_NX_MAJOR_VERSION=$(echo "$CURRENT_NX_VERSION" | cut -d. -f1)

setNewVersion() {

  local new_version=$1
  local dir=$2

  if [[ -z "$new_version" ]]; then
    echo "Please specify a new version."
    exit 1
  fi

  if [[ -z "$dir" ]]; then
    echo "Please specify a directory."
    exit 1
  fi

  if [[ -z "$new_version" ]]; then
    echo "Please specify a new version."
    exit 1
  fi

  find "$dir" -name "package.json" -type f | while read -r file; do
    jq ".version = \"$new_version\"" "$file" >tmp.$$.json && mv tmp.$$.json "$file"
    echo "Updated version in $file to $new_version"
  done

}

setNewVersion "${CURRENT_ANGULAR_MAJOR_VERSION}.0.0" "packages/angular"
setNewVersion "${CURRENT_ANGULAR_MAJOR_VERSION}.0.0" "packages/schematic"
setNewVersion "${CURRENT_NESTJS_MAJOR_VERSION}.0.0" "packages/nest"
setNewVersion "${CURRENT_NX_MAJOR_VERSION}.0.0" "packages/plugin"
setNewVersion "${CURRENT_NX_MAJOR_VERSION}.0.0" "packages/rxap"

# File Content
# export const ANGULAR_VERSION = '~16.2.0';
angular_version_file="packages/plugin/angular/src/lib/angular-version.ts"

# replace the version in the file
echo "Updating version in $angular_version_file to ~${CURRENT_ANGULAR_VERSION}"
sed -i "s/.[0-9]*\.[0-9]*\.[0-9]*/~${CURRENT_ANGULAR_VERSION}/g" "$angular_version_file"
# File Content
# export const NESTJS_VERSION = '^10.0.0';
# export const NESTJS_THROTTLE_VERSION = '^5.1.2';
# export const NESTJS_CACHE_MANAGER_VERSION = '^2.2.2';
# export const NESTJS_CONFIG_VERSION = '^3.2.2';
nestjs_version_file="packages/plugin/nestjs/src/lib/nestjs-version.ts"
CURRENT_NESTJS_THROTTLE_VERSION=$(jq -r '.dependencies["@nestjs/throttler"]' package.json)
CURRENT_NESTJS_CACHE_MANAGER_VERSION=$(jq -r '.dependencies["@nestjs/cache-manager"]' package.json)
CURRENT_NESTJS_CONFIG_VERSION=$(jq -r '.dependencies["@nestjs/config"]' package.json)
echo "Updating nestjs version in $nestjs_version_file to ~${CURRENT_NESTJS_VERSION}"
sed -i "s/NESTJS_VERSION = '.[0-9]*\.[0-9]*\.[0-9]*/NESTJS_VERSION = '~${CURRENT_NESTJS_VERSION}/g" "$nestjs_version_file"
echo "Updating nestjs throttle version in $nestjs_version_file to ~${CURRENT_NESTJS_THROTTLE_VERSION}"
sed -i "s/NESTJS_THROTTLE_VERSION = '.[0-9]*\.[0-9]*\.[0-9]*/NESTJS_THROTTLE_VERSION = '~${CURRENT_NESTJS_THROTTLE_VERSION}/g" "$nestjs_version_file"
echo "Updating nestjs cache manager version in $nestjs_version_file to ~${CURRENT_NESTJS_CACHE_MANAGER_VERSION}"
sed -i "s/NESTJS_CACHE_MANAGER_VERSION = '.[0-9]*\.[0-9]*\.[0-9]*/NESTJS_CACHE_MANAGER_VERSION = '~${CURRENT_NESTJS_CACHE_MANAGER_VERSION}/g" "$nestjs_version_file"
echo "Updating nestjs config version in $nestjs_version_file to ~${CURRENT_NESTJS_CONFIG_VERSION}"
sed -i "s/NESTJS_CONFIG_VERSION = '.[0-9]*\.[0-9]*\.[0-9]*/NESTJS_CONFIG_VERSION = '~${CURRENT_NESTJS_CONFIG_VERSION}/g" "$nestjs_version_file"

yarn

yarn nx run-many -t fix-dependencies --skip-nx-cache
yarn

yarn nx run-many -t update-package-group --skip-nx-cache
yarn
