import { ProjectConfiguration } from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';
import { PackageJson } from './package-json';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function IsPublishable(tree: TreeLike, project: ProjectConfiguration) {
  const treeAdapter = new TreeAdapter(tree);
  return IsBuildable(project) && treeAdapter.exists(join(project.root, 'package.json')) && treeAdapter.readJson<PackageJson>(join(project.root, 'package.json'))!.private !== true;
}
