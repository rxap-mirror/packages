import { ProjectConfiguration } from '@nx/devkit';
import {
  HasNgPackageJson,
  TreeLike,
  VisitTree,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function* ForEachSecondaryEntryPoint(tree: TreeLike, projectOrRoot: string | ProjectConfiguration): Generator<string, void, void> {
  const projectRoot = typeof projectOrRoot === 'string' ? projectOrRoot : projectOrRoot.root;
  for (const { path, isFile } of VisitTree(tree, projectRoot)) {
    if (!isFile) {
      continue;
    }
    // Skip the root ng-package.json
    if (HasNgPackageJson(tree, projectOrRoot)) {
      continue;
    }
    if (path.endsWith('ng-package.json')) {
      yield path;
    }
  }
}
