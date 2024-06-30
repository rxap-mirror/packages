import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  IsAngularProject,
  IsPublishable,
} from '@rxap/workspace-utilities';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { CoerceTypedocTarget } from '../../lib/coerce-typedoc-target';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init typedoc library project: ${ projectName }`);

  CoerceTypedocTarget(tree, projectName, project);

  if (IsPublishable(tree, project) && IsAngularProject(project)) {
    updateProjectNgPackageConfiguration(tree, project);
  }

  CoerceGitIgnore(tree, projectName);

}
