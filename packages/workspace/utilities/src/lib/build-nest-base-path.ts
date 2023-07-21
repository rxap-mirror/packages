import { join } from 'path';
import { GetProjectSourceRoot } from './get-project';
import { buildNestProjectName } from './project-utilities';
import { TreeLike } from './tree';

export interface BuildNestBasePathOptions {
  project: string;
  feature?: string | null;
  directory?: string | null;
  shared?: boolean;
}

export function BuildNestBasePath<Tree extends TreeLike>(tree: Tree, options: BuildNestBasePathOptions): string {
  let { directory } = options;
  directory ??= '';
  // get the project source root after the coerce call.
  // else it is possible that GetProjectSourceRoot fails, bc the project does not yet exist.
  const projectName = buildNestProjectName(options);
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);
  return join(projectSourceRoot, directory);
}
