import { join } from 'path';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
  GetProjectType,
} from './get-project';
import { TreeLike } from './tree';

export interface BuildAngularBasePathOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
  entrypoint?: string | null;
}

export function BuildAngularBasePath<Tree extends TreeLike>(
  tree: Tree,
  options: Readonly<BuildAngularBasePathOptions>,
): string {
  const { feature, shared, entrypoint } = options;
  let { project, directory } = options;
  directory ??= '';
  project = shared ? 'shared' : project;
  const type = GetProjectType(tree, project);
  if (entrypoint) {
    if (feature) {
      throw new Error('The feature option is not supported with the entrypoint option');
    }
    if (type !== 'library') {
      throw new Error('The entrypoint option is only supported for library project');
    }
    const projectRoot = GetProjectRoot(tree, project);
    return join(projectRoot, entrypoint, 'src', 'lib', directory);
  }
  const projectSourceRoot = GetProjectSourceRoot(tree, project);
  if (feature) {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', 'feature', feature, directory);
  } else {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', directory);
  }
}
