import { GetProject } from './get-project';
import { TreeLike } from './tree';

export function HasTarget(tree: TreeLike, projectName: string, targetName: string): boolean {
  const project = GetProject(tree, projectName);
  return !!project.targets?.[targetName];
}
