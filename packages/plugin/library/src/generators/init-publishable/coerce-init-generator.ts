import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { generatorGenerator } from '@nx/plugin/generators';
import {
  Assets,
  CoerceAssets,
  DeleteRecursive,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetTarget,
  GetTargetOptions,
  HasGenerator,
  IsAngularProject,
  ReadNgPackageJson,
  WriteNgPackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitPublishableGeneratorSchema } from './schema';

export async function CoerceInitGenerator(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {

  if (HasGenerator(tree, projectName, 'init')) {
    return;
  }

  console.log(`project: ${ projectName } has no init generator`.yellow);

  // region setup build assets options
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);
  const projectRoot = GetProjectRoot(tree, projectName);

  const generatorsAssets: Assets = [
    {
      input: './' + join(projectSourceRoot, 'generators'),
      glob: '**/!(*.ts',
      output: './src/generators',
    },
    {
      input: './' + projectRoot,
      glob: 'generators.json',
      output: '.',
    },
  ];

  if (IsAngularProject(project)) {
    const ngPackagr = ReadNgPackageJson(tree, project);
    ngPackagr.assets ??= [];
    CoerceAssets(ngPackagr.assets, generatorsAssets);
    WriteNgPackageJson(tree, project, ngPackagr);
  } else {
    const buildTarget = GetTarget(project, 'build');
    buildTarget.options ??= {};
    buildTarget.options.assets ??= [];
    CoerceAssets(buildTarget.options.assets, generatorsAssets);
  }
  // endregion

  await generatorGenerator(tree, {
    // directory: join(projectSourceRoot, 'generators', 'init'),
    name: 'init',
    description: 'Initialize the package in the workspace',
    unitTestRunner: 'none',
    nameAndDirectoryFormat: 'derived',
    project: projectName,
  });

  DeleteRecursive(tree, join(projectSourceRoot, 'generators', 'init'));

}
