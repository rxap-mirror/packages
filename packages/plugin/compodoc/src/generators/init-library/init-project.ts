import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  coerceIdeaExcludeFolders,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetTarget,
  GetWorkspaceProjectName,
  HasTarget,
  IsAngularProject,
  isJetbrainsProject,
  IsPublishable,
  IsWorkspaceProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceCompodocTsConfig } from '../../lib/coerce-compodoc-ts-config';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { InitLibraryGeneratorSchema } from './schema';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init compodoc library project: ${ projectName }`);

  if (IsPublishable(tree, project)) {
    if (IsAngularProject(project)) {
      updateProjectNgPackageConfiguration(tree, project);
    } else if (HasTarget(tree, projectName, 'build')) {
      const target = GetTarget(project, 'build');
      if (target.options['assets']) {
        const projectRoot = GetProjectRoot(tree, projectName);
        CoerceAssets(target.options.assets, [ join(projectRoot, 'compodoc') ]);
      }
    }
  }

  if (IsWorkspaceProject(project)) {
    const angularProjectIncludeList = Array.from(getProjects(tree))
      .filter(([_, project]) => !IsWorkspaceProject(project))
      .filter(([projectName]) => tree.exists(join(GetProjectRoot(tree, projectName), 'tsconfig.compodoc.json')))
      .map(([projectName]) => GetProjectSourceRoot(tree, projectName))
      .map(sourceRoot => [
        join(sourceRoot, 'lib/**/*.ts'),
        join(sourceRoot, 'index.ts'),
      ])
      .flat();
    CoerceCompodocTsConfig(tree, GetWorkspaceProjectName(tree), angularProjectIncludeList);
  } else {
    CoerceCompodocTsConfig(tree, projectName, ['src/index.ts', 'src/lib/**/*.ts']);
  }

  CoerceGitIgnore(tree, projectName);

  if (isJetbrainsProject(tree)) {
    await coerceIdeaExcludeFolders(tree, [
      join(project.root, 'compodoc'),
    ]);
  }

}
