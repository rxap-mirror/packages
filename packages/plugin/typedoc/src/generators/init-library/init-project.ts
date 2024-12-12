import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  GetProjectRoot,
  GetTarget,
  HasTarget,
  IsAngularProject,
  IsPublishable,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init typedoc library project: ${ projectName }`);

  if (IsPublishable(tree, project) && IsAngularProject(project)) {
    if (IsAngularProject(project)) {
      updateProjectNgPackageConfiguration(tree, project);
    } else if (HasTarget(tree, projectName, 'build')) {
      const target = GetTarget(project, 'build');
      if (target.options['assets']) {
        const projectRoot = GetProjectRoot(tree, projectName);
        CoerceAssets(target.options.assets, [ join(projectRoot, 'docs') ]);
      }
    }
  }

  CoerceGitIgnore(tree, projectName);

}
