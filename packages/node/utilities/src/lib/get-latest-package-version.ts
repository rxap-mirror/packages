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

  const info = await GetPackageInfo(packageName, skipCache);

  if (info) {
    const latestVersion = info['dist-tags'].latest;
    updateLastPackageVersionCache(packageName, latestVersion);
    return latestVersion;
  }

  return null;
}

