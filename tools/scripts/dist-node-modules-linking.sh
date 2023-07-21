#!/bin/bash

BASE_DIR=$(git rev-parse --show-toplevel)

cd "$BASE_DIR" || exit 1

# define directories
dist_dir="dist"
packages_dir="${dist_dir}/packages"
node_modules_dir="${dist_dir}/node_modules/@rxap"

# create node_modules directory if it doesn't exist
mkdir -p "${node_modules_dir}"

# loop over all package.json files
find "${packages_dir}" -name "package.json" | while read package_json; do
    # extract package directory
    package_dir=$(dirname "${package_json}")

    # extract package name, replace '/' with '-', remove the scope @rxap
    package_name=$(jq -r .name "${package_json}" | tr '/' '-' | sed 's/@rxap-//')

    rm -f "${node_modules_dir}/${package_name}" || true
    # create symlink
    echo "create symlink ${package_dir} -> ${node_modules_dir}/${package_name}"
    ln -s "../../../${package_dir}" "${node_modules_dir}/${package_name}"
done

