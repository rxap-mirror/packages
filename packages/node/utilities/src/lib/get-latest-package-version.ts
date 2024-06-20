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
 * Retrieves the file path for the `package.json` of the `rxap` package within a Node.js project.
 *
 * The function first checks if the `NX_WORKSPACE_ROOT` environment variable is set, which indicates
 * the root directory of an Nx workspace. If set, it constructs a path to the `package.json` of the
 * `rxap` package within the `node_modules` directory of the workspace. If the file exists at the
 * constructed path, it returns this path.
 *
 * If the `NX_WORKSPACE_ROOT` is not set or the file does not exist at the constructed path, the function
 * then attempts to resolve the path using Node.js's `require.resolve` method, which looks up the path
 * of the main entry file of the `rxap` package as specified in its `package.json`. If successful, it returns
 * the resolved path.
 *
 * If neither method can locate the `package.json`, the function logs an error message and returns `null`.
 *
 * @returns {string | null} The file path to the `package.json` of the `rxap` package if found, otherwise `null`.
 */
function getRxapPackageJsonFilePath(): string | null {

  if (process.env['NX_WORKSPACE_ROOT']) {
    const workspaceRoot = process.env['NX_WORKSPACE_ROOT'];
    const packageJsonFilePath = join(workspaceRoot, 'node_modules', 'rxap', 'package.json');
    if (existsSync(packageJsonFilePath)) {
      return packageJsonFilePath;
    }
  }

  try {
    return require.resolve('rxap');
  } catch (e: any) {
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

