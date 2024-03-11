import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import { get } from 'https';
import { tmpdir } from 'os';
import {
  basename,
  join,
} from 'path';
import { PackageJson } from './package-json';
import { SearchFileInDirectory } from './search-file-in-directory';

export interface NpmPackageInfo {
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  versions: Record<string, PackageJson>
}

const CACHE_FOLDER = join(tmpdir(), 'rxap', 'package-info');

const PACKAGE_INFO_CACHE: Record<string, NpmPackageInfo> = (() => {
  const cache: Record<string, NpmPackageInfo> = {};
  if (existsSync(CACHE_FOLDER)) {
    for (const {content, filePath} of SearchFileInDirectory(CACHE_FOLDER)) {
      const packageName = basename(filePath).replace('.json', '').replace(/___/g, '/');
      cache[packageName] = JSON.parse(content);
    }
  }
  return cache;
})();

function updatePackageInfoCache(packageName: string, content: NpmPackageInfo) {
  PACKAGE_INFO_CACHE[packageName] = content;
  mkdirSync(CACHE_FOLDER, { recursive: true });
  writeFileSync(join(CACHE_FOLDER, `${packageName.replace(/\//g, '___')}.json`), JSON.stringify(content, null, 2));
}

export async function GetPackageInfo(packageName: string, skipCache?: boolean): Promise<NpmPackageInfo | null> {

  if (!skipCache && PACKAGE_INFO_CACHE[packageName]) {
    return PACKAGE_INFO_CACHE[packageName];
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
