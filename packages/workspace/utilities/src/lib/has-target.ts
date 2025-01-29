import { GetProject } from './get-project';
import {
  IsTreeLike,
  TreeLike,
} from './tree';

/**
 * Determines if a specified target exists within a given project in a tree-like structure.
 *
 * @param {TreeLike} tree - The tree-like structure containing project data.
 * @param {string} projectName - The name of the project to search within the tree.
 * @param {string} targetName - The name of the target to check for in the specified project.
 * @returns {boolean} Returns `true` if the target exists in the project, otherwise `false`.
 *
 * @example
 * // Assuming a tree structure and a project named 'myProject' with a target named 'build'
 * const tree = {
 * projects: {
 * 'myProject': {
 * targets: {
 * 'build': {...}
 * }
 * }
 * }
 * };
 * const exists = HasTarget(tree, 'myProject', 'build'); // returns true
 */
export function HasTarget(project: { targets?: Record<string, any> }, targetName: string): boolean;
export function HasTarget(tree: TreeLike, projectName: string, targetName: string): boolean;
export function HasTarget(treeOrProject: TreeLike | { targets?: Record<string, any> }, projectNameOrTargetName: string, targetName?: string): boolean {
  if (IsTreeLike(treeOrProject)) {
    if (!targetName) {
      throw new Error('Ensure the target name parameter is defined');
    }
    const project = GetProject(treeOrProject, projectNameOrTargetName);
    return !!project.targets?.[targetName];
  } else {
    return !!treeOrProject.targets?.[projectNameOrTargetName];
  }
}
