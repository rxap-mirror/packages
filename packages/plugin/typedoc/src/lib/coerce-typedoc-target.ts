import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceTarget,
  GetProjectRoot,
  GetTarget,
  HasTarget,
  IsAngularProject,
  IsPublishable,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function CoerceTypedocTarget(tree: Tree, projectName: string, project: ProjectConfiguration) {
  const projectRoot = GetProjectRoot(tree, projectName);

  const outputPath = ['/','','.'].some(item => item === projectRoot) ? projectName : projectRoot;

  CoerceTarget(project, 'typedoc', {
    options: {
      outputPath: [
        join('dist', 'docs', outputPath),
        join(projectRoot, 'docs'),
      ],
    }
  }, Strategy.OVERWRITE);

  if (IsPublishable(tree,project) && !IsAngularProject(project) && HasTarget(tree, projectName, 'build')) {
    const target = GetTarget(project, 'build');
    if (target.options['assets']) {
      const projectRoot = GetProjectRoot(tree, projectName);
      CoerceAssets(target.options.assets, [ join(projectRoot, 'docs') ]);
    }
  }

}
