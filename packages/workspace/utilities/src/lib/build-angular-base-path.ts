import { join } from 'path';
import {
  GetProjectSourceRoot,
  GetProjectType,
} from './get-project';
import { TreeLike } from './tree';

export interface BuildAngularBasePathOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
}

export function BuildAngularBasePath<Tree extends TreeLike>(
  tree: Tree,
  options: Readonly<BuildAngularBasePathOptions>,
): string {
  const { feature, shared } = options;
  let { project, directory } = options;
  directory ??= '';
  project = shared ? 'shared' : project;
  const projectSourceRoot = GetProjectSourceRoot(tree, project);
  const type = GetProjectType(tree, project);
  if (feature) {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', 'feature', feature, directory);
  } else {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', directory);
  }
}
