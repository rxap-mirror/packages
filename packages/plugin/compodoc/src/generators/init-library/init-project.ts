import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { IsPublishable } from '@rxap/workspace-utilities';
import { CoerceCompodocTarget } from '../../lib/coerce-compodoc-target';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init compodoc library project: ${ projectName }`);

  if (IsPublishable(tree, project)) {
    updateProjectNgPackageConfiguration(tree, project);
  }

  CoerceCompodocTsConfig(tree, projectName);

  CoerceGitIgnore(tree, projectName);

}
