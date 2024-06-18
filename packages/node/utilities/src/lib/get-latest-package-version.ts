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

function updateLastPackageVersionCache(packageName: string, version: string) {
  LATEST_PACKAGE_VERSIONS[packageName] = version;
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(LATEST_PACKAGE_VERSIONS, null, 2));
}

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

function hasRxapPackage() {
  return !!getRxapPackageJsonFilePath();
}

function getRxapPackageJson() {
  const packageJsonFilePath = getRxapPackageJsonFilePath();
  if (!packageJsonFilePath) {
    throw new Error('Could not find the package json file for the package rxap');
  }
  return jsonFile<PackageJson>(packageJsonFilePath);
}

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

