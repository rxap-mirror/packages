import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { generatorGenerator } from '@nx/plugin/generators';
import {
  DeleteRecursive,
  GetProjectSourceRoot,
  HasGenerator,
  IsAngularProject,
  ReadNgPackageJson,
  WriteNgPackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceGeneratorsBuild } from './coerce-generators-build';
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
    CoerceGeneratorsBuild(tree, project);
    return;
  }

  console.log(`project: ${ projectName } has no init generator`.yellow);

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

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

  CoerceGeneratorsBuild(tree, project, true);

}
