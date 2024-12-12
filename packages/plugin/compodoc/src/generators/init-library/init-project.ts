import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetProjectSourceRoot,
  IsAngularProject,
  IsPublishable,
  SkipNonAngularProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init compodoc library project: ${ projectName }`);

  if (IsPublishable(tree, project) && IsAngularProject(project)) {
    updateProjectNgPackageConfiguration(tree, project);
  }

  if (projectName === 'workspace') {
    const angularProjectIncludeList = Array.from(getProjects(tree))
        .filter(([projectName, project]) => !SkipNonAngularProject(tree, {}, project, projectName))
        .map(([projectName]) => GetProjectSourceRoot(tree, projectName))
        .map(sourceRoot => join(sourceRoot, '**/*.ts'));
    CoerceCompodocTsConfig(tree, 'workspace', angularProjectIncludeList);
  } else {
    CoerceCompodocTsConfig(tree, projectName);
  }

  CoerceGitIgnore(tree, projectName);

}
