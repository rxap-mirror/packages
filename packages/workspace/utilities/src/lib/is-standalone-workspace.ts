import {
  GetProject,
  GetWorkspaceProject,
  HasProject,
  HasWorkspaceProject,
} from './get-project';
import { TreeLike } from './tree';

/**
 * Determines if a given tree structure represents a standalone workspace.
 *
 * A standalone workspace is identified by the presence of a 'workspace' project within the tree that has both 'build' and 'serve' targets defined.
 *
 * @param {TreeLike} tree - The tree structure to examine, which should conform to a specific interface that allows project and target inspection.
 * @returns {boolean} - Returns `true` if the tree contains a 'workspace' project with both 'build' and 'serve' targets, otherwise returns `false`.
 */
export function IsStandaloneWorkspace(tree: TreeLike): boolean {
  if (!HasWorkspaceProject(tree)) {
    return false;
  }
  const workspaceProject = GetWorkspaceProject(tree);
  return !!workspaceProject.targets?.['build'] && !!workspaceProject.targets?.['serve'];
}
