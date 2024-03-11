import { GetPackageInfo } from './get-package-info';

export async function GetPackagePeerDependencies(packageName: string, version = 'latest', skipCache = false) {

  const info = await GetPackageInfo(packageName, skipCache);

  return info?.versions[version]?.peerDependencies ?? {};

}
