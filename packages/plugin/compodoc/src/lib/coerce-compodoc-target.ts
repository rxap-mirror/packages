import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  GetProjectRoot,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function CoerceCompodocTarget(tree: Tree, projectName: string, project: ProjectConfiguration) {
  const projectRoot = GetProjectRoot(tree, projectName);

  CoerceTarget(project, 'compodoc', {
    options: {
      tsConfig: join(projectRoot, 'tsconfig.compodoc.json'),
      outputPath: join('dist', 'compodoc', projectRoot),
    }
  }, Strategy.OVERWRITE);
}
