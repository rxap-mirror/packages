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
  HasGenerator,
  IsAngularProject,
  ReadNgPackageJson,
  WriteNgPackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitPublishableGeneratorSchema } from './schema';

export async function CoerceInitGenerator(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {

  if (IsAngularProject(project)) {
    const ngPackagr = ReadNgPackageJson(tree, project);
    ngPackagr.allowedNonPeerDependencies ??= [];
    ngPackagr.allowedNonPeerDependencies.push('@nx/devkit');
    ngPackagr.allowedNonPeerDependencies = Array.from(new Set(ngPackagr.allowedNonPeerDependencies));
    WriteNgPackageJson(tree, project, ngPackagr);
  }

  if (HasGenerator(tree, projectName, 'init')) {
    return;
  }

  console.log(`project: ${ projectName } has no init generator`.yellow);

  // region setup build assets options
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);
  const projectRoot = GetProjectRoot(tree, projectName);

  if (IsAngularProject(project)) {
    const ngPackagr = ReadNgPackageJson(tree, project);
    ngPackagr.assets ??= [];
    CoerceAssets(ngPackagr.assets, [
      {
        input: join('src', 'generators'),
        glob: '**/!(*.ts|*.js|*.json)',
        output: join('src', 'generators'),
      },
      'generators.json'
    ]);
    WriteNgPackageJson(tree, project, ngPackagr);
  } else {
    const buildTarget = GetTarget(project, 'build');
    buildTarget.options ??= {};
    buildTarget.options.assets ??= [];
    CoerceAssets(buildTarget.options.assets, [
      {
        input: './' + join(projectSourceRoot, 'generators'),
        glob: '**/!(*.ts|*.js|*.json)',
        output: './src/generators',
      },
      {
        input: './' + projectRoot,
        glob: 'generators.json',
        output: '.',
      },
    ]);
  }
  // endregion

  try {
    await generatorGenerator(tree, {
      path: join(projectSourceRoot, 'generators', 'init', 'generator'),
      name: 'init',
      description: 'Initialize the package in the workspace',
      unitTestRunner: 'none',
    });

    DeleteRecursive(tree, join(projectSourceRoot, 'generators', 'init'));
  } catch (e: any) {
    console.log(`Error while generating the init generator: ${e.message}`.red);
  }

}
