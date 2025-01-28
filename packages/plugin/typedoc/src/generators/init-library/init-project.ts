import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceTarget,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetTarget,
  GetWorkspaceProjectName,
  HasTarget,
  IsAngularProject,
  IsPublishable,
  IsWorkspaceProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { CoerceTypedocTsConfig } from '../../lib/coerce-typedoc-ts-config';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init typedoc library project: ${ projectName }`);

  if (IsPublishable(tree, project)) {
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

  if (IsWorkspaceProject(project)) {
    const includeList = Array.from(getProjects(tree))
      .filter(([_, project]) => !IsWorkspaceProject(project))
      .filter(([projectName]) => tree.exists(join(GetProjectRoot(tree, projectName), 'tsconfig.typedoc.json')))
      .map(([projectName]) => GetProjectSourceRoot(tree, projectName))
      .map(sourceRoot => join(sourceRoot, '**/*.ts'));
    CoerceTypedocTsConfig(tree, GetWorkspaceProjectName(tree), includeList);
    const entryPoints = Array.from(getProjects(tree))
      .filter(([_, project]) => !IsWorkspaceProject(project))
      .filter(([projectName]) => tree.exists(join(GetProjectRoot(tree, projectName), 'tsconfig.typedoc.json')))
      .map(([projectName]) => GetProjectSourceRoot(tree, projectName))
      .map(sourceRoot => join(sourceRoot, 'index.ts'));
    CoerceTarget(project, 'typedoc', {
      options: { entryPoints }
    });
  } else {
    CoerceTypedocTsConfig(tree, projectName);
  }

  CoerceGitIgnore(tree, projectName);

}
