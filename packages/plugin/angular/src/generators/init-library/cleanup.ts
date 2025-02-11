import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  DeleteRecursive,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function cleanup(tree: Tree, project: ProjectConfiguration, projectName: string) {
  const projectSourceRoot = GetProjectSourceRoot(project);

  if (tree.exists(join(projectSourceRoot, 'lib', projectName))) {
    DeleteRecursive(tree, join(projectSourceRoot, 'lib', projectName));
    CoerceFile(tree, join(projectSourceRoot, 'index.ts'), 'export {};', true);
  }
}
