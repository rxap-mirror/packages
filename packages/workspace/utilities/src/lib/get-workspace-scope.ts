import { GetRootPackageJson } from './package-json-file';
import { TreeLike } from './tree';

export function GetWorkspaceScope(tree?: TreeLike) {
  const rootPackageJson = GetRootPackageJson(tree);

  const name = rootPackageJson['name'];

  if (typeof name !== 'string') {
    throw new Error('The root package.json file does not contain a name property');
  }

  if (name.startsWith('@')) {
    return name;
  }

  return `@${ name }`;

}
