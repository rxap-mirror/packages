import { join } from 'path';
import { GetProjectRoot } from './get-project';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

/**
 * Determines whether a specified project within a tree-like structure contains migration files.
 *
 * This function checks for the existence of migration-related files in two possible locations within
 * the project's directory: directly under a 'migrations.json' file or within a 'migrations' folder
 * located under the 'src' directory.
 *
 * @param {TreeLike} tree - The tree-like structure representing the file system or project hierarchy.
 * @param {{ name: string }} project - An object containing the name of the project to check for migrations.
 * @returns {boolean} - Returns `true` if either 'migrations.json' exists at the project root or a 'migrations'
 * folder exists under the 'src' directory of the project. Returns `false` otherwise.
 */
export function HasMigrations(tree: TreeLike, project: { name: string }): boolean {
  const treeAdapter = new TreeAdapter(tree);
  const projectRoot = GetProjectRoot(tree, project.name);
  return treeAdapter.exists(join(projectRoot, 'migrations.json')) ||
         treeAdapter.exists(join(projectRoot, 'src', 'migrations'));
}
