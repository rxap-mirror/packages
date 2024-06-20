import { GetPackageInfo } from './get-package-info';

/**
 * Retrieves the peer dependencies of a specific package and version from the npm registry.
 *
 * This function fetches the package information using the `GetPackageInfo` function, then extracts and returns the peer dependencies for the specified version. If the specified version does not have any peer dependencies or the package information is not available, it returns an empty object.
 *
 * @param {string} packageName - The name of the package for which to retrieve peer dependencies.
 * @param {string} [version='latest'] - The version of the package to query. Defaults to 'latest'.
 * @param {boolean} [skipCache=false] - A boolean flag indicating whether to bypass the cache when fetching the package information.
 * @returns {Promise<Record<string, string>>} A promise that resolves to an object containing the peer dependencies, where keys are package names and values are version ranges.
 */
export async function GetPackagePeerDependencies(packageName: string, version = 'latest', skipCache = false) {

  const info = await GetPackageInfo(packageName, skipCache);

  return info?.versions[version]?.peerDependencies ?? {};

}
