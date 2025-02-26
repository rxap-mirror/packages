import {
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  Assets,
  CoerceAssets,
  GetProjectRoot,
  GetTarget,
  GetTargetOptions,
  HasNgPackageJson,
  IsAngularProject,
  NgPackageJson,
  UpdateJsonFile,
  UpdateNgPackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';

function coerceAssetsInBuildTarget(tree: Tree, projectName: string, project: ProjectConfiguration) {

  const projectRoot = GetProjectRoot(tree, projectName);

  const buildTarget = GetTarget(project, 'build');
  const buildTargetOptions: { assets?: Assets } = GetTargetOptions(buildTarget);
  buildTargetOptions.assets ??= [];
  CoerceAssets(buildTargetOptions.assets, [
    {
      input: `./${projectRoot}`,
      glob: "migrations.json",
      output: "."
    },
    {
      input: `./${projectRoot}/src/migrations`,
      glob: "**/!(*.ts|*.js|*.json)",
      output: "./src/migrations"
    }
  ]);
  updateProjectConfiguration(tree, projectName, project);
}

function coerceAssetsInNgPackageJson(tree: Tree, projectName: string, project: ProjectConfiguration) {
  const projectRoot = GetProjectRoot(tree, projectName);

  if (!HasNgPackageJson(tree, projectRoot)) {
    throw new Error(`The ng-package.json file does not exists in the project root: ${projectRoot}`);
  }

  UpdateNgPackageJson(tree, (ngPackageJson: NgPackageJson) => {
    ngPackageJson.assets ??= [];
    CoerceAssets(ngPackageJson.assets, [
      'migrations.json',
      {
        input: join('src', 'migrations'),
        glob: "**/!(*.ts|*.js|*.json)",
        output: join('src', 'migrations')
      }
    ]);
  }, { projectRoot });

}

export function coerceAssetsConfiguration(tree: Tree, projectName: string, project: ProjectConfiguration) {

  if (IsAngularProject(project)) {
    coerceAssetsInNgPackageJson(tree, projectName, project);
  } else {
    coerceAssetsInBuildTarget(tree, projectName, project);
  }

}
