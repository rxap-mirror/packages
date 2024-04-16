import {
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  equals,
} from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  CoerceTarget,
  GetProjectRoot,
  HasProject,
  UpdateJsonFile,
  UpdateProjectPackageJson,
  UpdateProjectTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import initLibraryGenerator from '../init-library/generator';
import { ConvertToBuildableLibraryGeneratorSchema } from './schema';

export async function convertToBuildableLibraryGenerator(
  tree: Tree,
  options: ConvertToBuildableLibraryGeneratorSchema,
) {
  if (!HasProject(tree, options.project)) {
    throw new Error(`Project ${ options.project } not found`);
  }

  await AddPackageJsonDevDependency(tree, 'postcss', '^8.3.6', { soft: true });
  await AddPackageJsonDevDependency(tree, 'postcss-import', '~14.1.0', { soft: true });
  await AddPackageJsonDevDependency(tree, 'postcss-preset-env', '~7.5.0', { soft: true });
  await AddPackageJsonDevDependency(tree, 'postcss-url', '~10.1.3', { soft: true });

  const projectRoot = GetProjectRoot(tree, options.project);
  const toRoot = relative(projectRoot, '/');

  const project = readProjectConfiguration(tree, options.project);

  CoerceTarget(project, 'build', {
    executor: '@nx/angular:ng-packagr-lite',
    outputs: [
      '{workspaceRoot}/dist/{projectRoot}',
    ],
    options: {
      project: 'angular/components/ng-package.json',
    },
    configurations: {
      production: {
        tsConfig: 'angular/components/tsconfig.lib.prod.json',
      },
      development: {
        tsConfig: 'angular/components/tsconfig.lib.json',
      },
    },
    defaultConfiguration: 'production',
  });

  UpdateJsonFile(tree, ngPackage => {
    ngPackage.$schema = join(toRoot, 'node_modules/ng-packagr/ng-package.schema.json');
    ngPackage.lib ??= {};
    ngPackage.lib.entryFile = 'src/index.ts';
    ngPackage.dist ??= join(toRoot, 'dist', projectRoot);
  }, join(projectRoot, 'ng-package.json'), { create: true });

  UpdateProjectPackageJson(tree, (packageJson) => {
    packageJson.name = options.project;
    packageJson.private = true;
    packageJson.peerDependencies ??= {};
    packageJson.dependencies ??= {};
    packageJson.dependencies['tslib'] = '^2.3.0';
    packageJson.sideEffects = false;
    packageJson.version = '0.0.0';
  }, {
    projectName: options.project,
    create: true,
  });

  UpdateJsonFile(tree, eslintrc => {
    CoerceArrayItems(eslintrc.overrides, [
      {
        files: [
          '*.json',
        ],
        parser: 'jsonc-eslint-parser',
        rules: {
          '@nx/dependency-checks': 'error',
        },
      },
    ], (a, b) => a.parser === b.parser && equals(a.files, b.files));
  }, join(projectRoot, '.eslintrc.json'));

  UpdateProjectTsConfigJson(tree, (tsConfig) => {
    tsConfig.extends = './tsconfig.lib.json';
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.declarationMap ??= false;
    tsConfig.angularCompilerOptions ??= {};
  }, {
    project: options.project,
    infix: 'lib.prod',
  });

  await initLibraryGenerator(tree, { project: options.project });

}

export default convertToBuildableLibraryGenerator;
