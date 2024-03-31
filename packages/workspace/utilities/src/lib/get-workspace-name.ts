import { GetRootPackageJson } from './package-json-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';


export function GetWorkspaceName(tree: TreeLike): string {
  const treeAdapter = new TreeAdapter(tree);
  const rootPackageJson = GetRootPackageJson(treeAdapter);
  const name = rootPackageJson.name!;
  const match = name?.match(/@([^/]+)\/(.+)$/);
  if (match) {
    if (match[2] === 'source') {
      return match[1];
    }
    return match[2];
  }
  return name;
}
