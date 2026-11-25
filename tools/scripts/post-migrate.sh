#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

set -e

# the version of a root dependency without a range prefix (^1.2.3 / ~1.2.3 / >=1.2.3 -> 1.2.3)
rootVersion() {
  jq -r --arg name "$1" '.dependencies[$name] // .devDependencies[$name] // empty' package.json | sed -E 's/^[^0-9]*//'
}

# 1. complete the framework group(s) the migration touched: lockstep members + followers, all through the release
#    cooldown (fails when a member is too young; the migration has to wait then)
BASE_REF="origin/${CI_DEFAULT_BRANCH:-development}"
if BASE=$(git merge-base HEAD "$BASE_REF" 2>/dev/null); then
  node tools/scripts/align-framework-group.mjs --changed-since "$BASE"
else
  echo "No merge base with $BASE_REF: aligning every framework group"
  node tools/scripts/align-framework-group.mjs
fi
node tools/scripts/align-framework-dep-versions.mjs

# 2. stamp the package majors and the version constants of the generators
CURRENT_ANGULAR_VERSION=$(rootVersion "@angular/core")
CURRENT_ANGULAR_MAJOR_VERSION=$(echo "$CURRENT_ANGULAR_VERSION" | cut -d. -f1)

CURRENT_NESTJS_VERSION=$(rootVersion "@nestjs/core")
CURRENT_NESTJS_MAJOR_VERSION=$(echo "$CURRENT_NESTJS_VERSION" | cut -d. -f1)

CURRENT_NX_VERSION=$(rootVersion "nx")
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

  find "$dir" -name "package.json" -type f -not -path '*/node_modules/*' | while read -r file; do
    # check if the package.json has a version field
    if ! grep -q '"version":' "$file"; then
      echo "No version field found in $file"
      continue
    fi
    # check if the current major version is the same as the new major version
    current_version=$(jq -r '.version' "$file")
    current_major_version=$(echo "$current_version" | sed -E 's/^[^0-9]*//' | cut -d. -f1)
    new_major_version=$(echo "$new_version" | cut -d. -f1)
    if [[ "$current_major_version" == "$new_major_version" ]]; then
      echo "Skipping $file. Current major version is $current_major_version, new major version is $new_major_version"
      continue
    fi
    echo "Updated version in $file to $new_version"
    jq ".version = \"$new_version\"" "$file" >tmp.$$.json && mv tmp.$$.json "$file"
  done

}

setNewVersion "${CURRENT_ANGULAR_MAJOR_VERSION}.0.0" "packages/angular"
setNewVersion "${CURRENT_ANGULAR_MAJOR_VERSION}.0.0" "packages/schematic"
setNewVersion "${CURRENT_NESTJS_MAJOR_VERSION}.0.0" "packages/nest"
setNewVersion "${CURRENT_NX_MAJOR_VERSION}.0.0" "packages/plugin"
setNewVersion "${CURRENT_NX_MAJOR_VERSION}.0.0" "packages/rxap"
setNewVersion "${CURRENT_NX_MAJOR_VERSION}.0.0" "packages/workspace"

# setVersionConstant <file> <CONSTANT> <package>: export const <CONSTANT> = '~<root version of package>';
# only the quoted value of that one constant is replaced (comments and other constants stay untouched)
setVersionConstant() {
  local file=$1 constant=$2 version
  version=$(rootVersion "$3")
  if [[ -z "$version" ]]; then
    echo "No root dependency $3: $constant in $file stays as it is"
    return
  fi
  echo "Updating $constant in $file to ~$version"
  sed -i -E "s/(export const ${constant} = ')[^']*'/\1~${version}'/" "$file"
}

setVersionConstant "packages/plugin/angular/src/lib/angular-version.ts" ANGULAR_VERSION "@angular/core"
nestjs_version_file="packages/plugin/nestjs/src/lib/nestjs-version.ts"
setVersionConstant "$nestjs_version_file" NESTJS_VERSION "@nestjs/core"
setVersionConstant "$nestjs_version_file" NESTJS_THROTTLE_VERSION "@nestjs/throttler"
setVersionConstant "$nestjs_version_file" NESTJS_TERMINUS_VERSION "@nestjs/terminus"
setVersionConstant "$nestjs_version_file" NESTJS_CACHE_MANAGER_VERSION "@nestjs/cache-manager"
setVersionConstant "$nestjs_version_file" NESTJS_CONFIG_VERSION "@nestjs/config"

pnpm install

pnpm nx run-many -t fix-dependencies --skip-nx-cache
pnpm install

pnpm nx run-many -t update-package-group --skip-nx-cache
pnpm install
