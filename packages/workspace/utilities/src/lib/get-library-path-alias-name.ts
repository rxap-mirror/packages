import {
  GetProjectPackageJson,
  HasProjectPackageJson,
} from '@rxap/workspace-utilities';
import { TreeLike } from './tree';

export function GetLibraryPathAliasName(tree: TreeLike, projectName: string) {

  let pathName = projectName;

  if (HasProjectPackageJson(tree, projectName)) {
    const packageJson = GetProjectPackageJson(tree, projectName);
    if (packageJson.name) {
      pathName = packageJson.name;
    }
  }

  return pathName;

}
