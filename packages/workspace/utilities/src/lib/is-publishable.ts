import { ProjectConfiguration } from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';
import { IsLibraryProject } from './is-project';
import { PackageJson } from './package-json';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function IsPublishable(tree: TreeLike, project: ProjectConfiguration) {
  const treeAdapter = new TreeAdapter(tree);
  if (!IsLibraryProject(project) || !IsBuildable(project) || !treeAdapter.exists(join(project.root, 'package.json'))) {
    return false;
  }
  return !treeAdapter.readJson<PackageJson>(join(project.root, 'package.json'))!.private;
}
