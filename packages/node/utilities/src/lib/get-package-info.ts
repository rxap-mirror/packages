import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { get } from 'https';
import { tmpdir } from 'os';
import { join } from 'path';
import { PackageJson } from './package-json';

export interface NpmPackageInfo {
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: Record<string, PackageJson>
}

const CACHE_FOLDER = join(tmpdir(), 'rxap', 'package-info');

const PACKAGE_INFO_CACHE: Record<string, NpmPackageInfo> = {};

function cacheFilePath(packageName: string) {
  return join(CACHE_FOLDER, `${ packageName.replace(/\//g, '___') }.json`);
}

/**
 * Returns the cached package information, reading the cache file of this one package on first access.
 *
 * The cache folder can hold hundreds of megabytes of npm metadata. It is read lazily per package, so importing
 * this module (e.g. in every Nx plugin worker) costs no memory.
 */
function readPackageInfoCache(packageName: string): NpmPackageInfo | undefined {
  if (!PACKAGE_INFO_CACHE[packageName]) {
    const filePath = cacheFilePath(packageName);
    if (existsSync(filePath)) {
      try {
        PACKAGE_INFO_CACHE[packageName] = JSON.parse(readFileSync(filePath, 'utf-8'));
      } catch {
        // a corrupt cache file is treated as a cache miss
      }
    }
  }
  return PACKAGE_INFO_CACHE[packageName];
}

/**
 * Updates the local cache with the provided package information and writes it to a file.
 *
 * This function updates an in-memory cache and persists the package information to the filesystem.
 * It ensures that the cache directory exists by creating it if necessary, and then writes the
 * package information to a JSON file named after the package, with special characters in the
 * package name replaced to ensure file system compatibility.
 *
 * @param packageName - The name of the package to update in the cache.
 * @param content - The NpmPackageInfo object containing the metadata of the package.
 */
function updatePackageInfoCache(packageName: string, content: NpmPackageInfo) {
  PACKAGE_INFO_CACHE[packageName] = content;
  mkdirSync(CACHE_FOLDER, { recursive: true });
  writeFileSync(cacheFilePath(packageName), JSON.stringify(content, null, 2));
}

/**
 * Asynchronously retrieves information about a specified npm package.
 *
 * This function fetches package information from the npm registry. If caching is enabled and the package
 * information is already cached, it returns the cached data to reduce network calls. If the package information
 * is not cached or caching is skipped, it makes an HTTP request to the npm registry.
 *
 * @param packageName The name of the npm package for which information is required.
 * @param skipCache Optional. If true, the function will bypass the cache and fetch data directly from the npm registry.
 * @returns A Promise that resolves to an `NpmPackageInfo` object containing the package information, or null if an error occurs
 * during the fetch operation or if the package does not exist.
 */
export async function GetPackageInfo(packageName: string, skipCache?: boolean): Promise<NpmPackageInfo | null> {

  if (!skipCache) {
    const cached = readPackageInfoCache(packageName);
    if (cached) {
      return cached;
    }
  }

  return new Promise((resolve, reject) => {
    get(`https://registry.npmjs.org/${ packageName }`, (res) => {
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            console.error(`Error getting npm package version: ${ jsonData.error }`);
            resolve(null);
          } else {
            updatePackageInfoCache(packageName, jsonData);
            resolve(jsonData);
          }
        } catch (error: any) {
          console.error(`Error parsing npm JSON response: ${ error.message }`);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`Network Error getting npm package version: ${ error.message }`);
      resolve(null);
    });
  });

}
