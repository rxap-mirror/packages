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
  UpdateJsonFile,
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
      .map(sourceRoot => [
        join(sourceRoot, 'lib/**/*.ts'),
        join(sourceRoot, 'index.ts'),
      ])
      .flat();
    CoerceTypedocTsConfig(tree, GetWorkspaceProjectName(tree), includeList);
    UpdateJsonFile(tree, typedoc => {

      typedoc['entryPointStrategy'] = 'packages';
      typedoc['includeVersion'] = false;
      typedoc['packageOptions'] ??= {};
      typedoc['packageOptions']['tsconfig'] ??= 'tsconfig.typedoc.json';
      typedoc['packageOptions']['includeVersion'] ??= true;
      typedoc['packageOptions']['entryPoints'] ??= ["src/index.ts"];

      typedoc['entryPoints'] = Array.from(getProjects(tree))
        .filter(([_, project]) => !IsWorkspaceProject(project))
        .filter(([projectName]) => tree.exists(join(GetProjectRoot(tree, projectName), 'tsconfig.typedoc.json')))
        .map(([projectName]) => GetProjectRoot(tree, projectName));

    }, 'typedoc.json', { create: true });
  } else {
    CoerceTypedocTsConfig(tree, projectName, ['src/index.ts', 'src/lib/**/*.ts']);
  }

  CoerceGitIgnore(tree, projectName);

  if (isJetbrainsProject(tree)) {
    await coerceIdeaExcludeFolders(tree, [
      join(project.root, 'docs'),
    ]);
  }


}
