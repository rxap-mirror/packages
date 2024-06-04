import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { DeleteRecursive } from '@rxap/workspace-utilities';
import { join } from 'path';

export function cleanup(tree: Tree, project: ProjectConfiguration, projectName: string) {
  const projectSourceRoot = project.sourceRoot;

  if (!projectSourceRoot) {
    throw new Error(`The project ${ projectName } has no sourceRoot`);
  }

  if (tree.exists(join(projectSourceRoot, 'lib', projectName))) {
    DeleteRecursive(tree, join(projectSourceRoot, 'lib', projectName));
    tree.write(join(projectSourceRoot, 'index.ts'), 'export {};');
  }
}
