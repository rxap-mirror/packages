import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { get } from 'https';
import { tmpdir } from 'os';
import {
  dirname,
  join,
} from 'path';

const CACHE_FILE = join(tmpdir(), 'rxap', 'latest-package-versions.json');

const LATEST_PACKAGE_VERSIONS: Record<string, string> = (() => {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE).toString());
  }
  return {};
})();

function updateLastPackageVersionCache(packageName: string, version: string) {
  LATEST_PACKAGE_VERSIONS[packageName] = version;
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(LATEST_PACKAGE_VERSIONS, null, 2));
}

export async function GetLatestPackageVersion(packageName: string, skipCache?: boolean): Promise<string | null> {
  if (!skipCache && LATEST_PACKAGE_VERSIONS[packageName]) {
    return LATEST_PACKAGE_VERSIONS[packageName];
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
            const latestVersion = jsonData['dist-tags'].latest;
            updateLastPackageVersionCache(packageName, latestVersion);
            resolve(latestVersion);
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

