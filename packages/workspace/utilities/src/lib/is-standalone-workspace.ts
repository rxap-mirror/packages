import {
  GetProject,
  HasProject,
} from './get-project';
import { TreeLike } from './tree';

export function IsStandaloneWorkspace(tree: TreeLike): boolean {
  if (!HasProject(tree, 'workspace')) {
    return false;
  }
  const workspaceProject = GetProject(tree, 'workspace');
  return !!workspaceProject.targets?.['build'] && !!workspaceProject.targets?.['serve'];
}
