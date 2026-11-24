import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import {
  dirname,
  join,
} from 'path';
import { GetPackageInfo } from './get-package-info';
import { jsonFile } from './json-file';
import { PackageJson } from './package-json';

const CACHE_FILE = join(tmpdir(), 'rxap', 'latest-package-versions.json');

const LATEST_PACKAGE_VERSIONS: Record<string, string> = (() => {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE).toString());
  }
  return {};
})();

/**
 * Updates the cache with the latest version of a specified package and persists the updated cache to a file.
 *
 * This function updates the in-memory cache of latest package versions, setting the specified package's version.
 * It ensures that the directory for the cache file exists, creating it if necessary, and then writes the updated
 * cache to a file in a human-readable JSON format.
 *
 * @param packageName - The name of the package to update.
 * @param version - The new version of the package to be set in the cache.
 */
function updateLastPackageVersionCache(packageName: string, version: string) {
  LATEST_PACKAGE_VERSIONS[packageName] = version;
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(LATEST_PACKAGE_VERSIONS, null, 2));
}

/**
 * The `package.json` of the `rxap` umbrella package. The specifier is assembled at runtime because `rxap` is
 * not a dependency of this package: it is installed by the consuming workspace, so a literal would be reported
 * as an undeclared dependency.
 */
const RXAP_PACKAGE_JSON = [ 'rxap', 'package.json' ].join('/');

/**
 * Retrieves the file path for the `package.json` of the `rxap` package installed in the current workspace.
 *
 * The package is resolved from the workspace root (`NX_WORKSPACE_ROOT`, falling back to the current working
 * directory) and not from the location of this package: with an isolated `node_modules` layout (pnpm) only the
 * declared dependencies of this package are resolvable from its own location.
 *
 * @returns {string | null} The file path to the `package.json` of the `rxap` package if found, otherwise `null`.
 */
function getRxapPackageJsonFilePath(): string | null {
  const paths = [ process.env['NX_WORKSPACE_ROOT'], process.cwd() ].filter((path): path is string => !!path);
  try {
    return require.resolve(RXAP_PACKAGE_JSON, { paths });
  } catch {
    console.log('Could not resolve the package rxap');
  }
  return null;
}

/**
 * Checks if the RxAP package is present in the project.
 *
 * This function determines the existence of the RxAP package by attempting to locate its package.json file.
 * It utilizes the `getRxapPackageJsonFilePath` function to retrieve the path to the package.json file of the RxAP package.
 * If the path exists, it returns true, indicating that the RxAP package is installed; otherwise, it returns false.
 *
 * @returns {boolean} True if the RxAP package is found, otherwise false.
 */
function hasRxapPackage() {
  return !!getRxapPackageJsonFilePath();
}

/**
 * Retrieves the `package.json` content for the `rxap` package.
 *
 * This function first determines the file path of the `package.json` for the `rxap` package by calling `getRxapPackageJsonFilePath()`.
 * If the file path is not found, it throws an error indicating the absence of the `package.json` file.
 * If the file path is found, it reads and returns the content of the `package.json` file as a JSON object of type `PackageJson`.
 *
 * @returns {PackageJson} The JSON object representing the `package.json` of the `rxap` package.
 * @throws {Error} If the `package.json` file path for the `rxap` package cannot be found.
 */
function getRxapPackageJson() {
  const packageJsonFilePath = getRxapPackageJsonFilePath();
  if (!packageJsonFilePath) {
    throw new Error('Could not find the package json file for the package rxap');
  }
  return jsonFile<PackageJson>(packageJsonFilePath);
}

/**
 * Asynchronously retrieves the latest version of a specified package, optionally bypassing the cache.
 *
 * This function first checks if the package version is available in a local cache (`LATEST_PACKAGE_VERSIONS`) unless
 * explicitly instructed to skip this cache. If the package version is not cached or cache is skipped, it attempts to
 * fetch the version from a predefined package group (`nx-migrations` in `rxapPackageJson`). If the package is not found
 * in the predefined group, it then fetches the package information from a remote source using `GetPackageInfo`.
 *
 * If the remote fetch is successful and the package information includes distribution tags, it updates the cache with
 * the latest version and returns it. If the fetched package information is invalid (i.e., lacks distribution tags),
 * the function logs the detailed package information and throws an error.
 *
 * @param {string} packageName - The name of the package for which the latest version is to be retrieved.
 * @param {boolean} [skipCache=false] - Optional flag to bypass the local cache check and force a fetch from remote sources.
 * @returns {Promise<string | null>} A promise that resolves to the latest version string of the package, or null if the
 * package cannot be found or if the package information is invalid.
 * @throws {Error} Throws an error if the package information fetched from the remote source is invalid.
 */
export async function GetLatestPackageVersion(packageName: string, skipCache?: boolean): Promise<string | null> {
  if (!skipCache && LATEST_PACKAGE_VERSIONS[packageName]) {
    return LATEST_PACKAGE_VERSIONS[packageName];
  }

  if (hasRxapPackage()) {
    const rxapPackageJson = getRxapPackageJson();
    const packageGroupList: Array<{ package: string, version: string }> = rxapPackageJson['nx-migrations']?.packageGroup ?? [];
    const packageGroup = packageGroupList.find(group => group.package === packageName);
    if (packageGroup) {
      updateLastPackageVersionCache(packageName, packageGroup.version);
      return packageGroup.version;
    }
  }

  const info = await GetPackageInfo(packageName, skipCache);

  if (info) {
    if (!info['dist-tags']) {
      console.log(JSON.stringify(info, null, 2));
      throw new Error(`Invalid package info for ${packageName}`);
    }
    const latestVersion = info['dist-tags'].latest;
    updateLastPackageVersionCache(packageName, latestVersion);
    return latestVersion;
  }

  return null;
}

