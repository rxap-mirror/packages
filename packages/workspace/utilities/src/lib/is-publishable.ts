import { ProjectConfiguration } from '@nx/devkit';
import { join } from 'path';
import { IsBuildable } from './is-buildable';
import { IsLibraryProject } from './is-project';
import { PackageJson } from './package-json';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

/**
 * Determines if a project is publishable based on its configuration and file structure.
 *
 * This function checks if the given project is a library, is buildable, and contains a non-private `package.json` file
 * at the project root. The function utilizes a `TreeAdapter` to interact with the file system structure provided by `tree`.
 *
 * @param {TreeLike} tree - The file system abstraction used to access files within the project.
 * @param {ProjectConfiguration} project - The configuration object of the project, including properties like the project type and root directory.
 * @returns {boolean} Returns `true` if the project is a library, is buildable, and has a non-private `package.json` file; otherwise, returns `false`.
 */
export function IsPublishable(tree: TreeLike, project: ProjectConfiguration) {
  const treeAdapter = new TreeAdapter(tree);
  if (!IsLibraryProject(project) || !IsBuildable(tree, project) || !treeAdapter.exists(join(project.root, 'package.json'))) {
    return false;
  }
  return !treeAdapter.readJson<PackageJson>(join(project.root, 'package.json'))!.private;
}
