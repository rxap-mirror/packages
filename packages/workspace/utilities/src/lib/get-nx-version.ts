import {
  GetRootPackageJson,
  IsJsonObject,
  TreeLike,
} from '@rxap/workspace-utilities';

export function GetNxVersion(tree?: TreeLike) {
  const rootPackageJson = GetRootPackageJson(tree);

  if (!rootPackageJson['devDependencies']) {
    throw new Error('The root package.json file does not contain a devDependencies property');
  }

  if (!IsJsonObject(rootPackageJson['devDependencies'])) {
    throw new Error('The root package.json file devDependencies property is not a valid JSON object');
  }

  const devDependencies = rootPackageJson['devDependencies'] as Record<string, string>;

  if (!devDependencies['nx']) {
    throw new Error('The root package.json file does not contain a devDependencies "nx"');
  }

  return devDependencies['nx'];

}
