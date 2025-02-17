import {
  ProjectConfiguration,
  readJson,
  Tree,
} from '@nx/devkit';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { unique } from '@rxap/utilities';
import {
  CoerceFile,
  CoerceFilesStructure,
  CoerceIgnorePattern,
  GetProject,
  IsRxapRepository,
  RemoveIgnorePattern,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { CoerceInitGenerator } from './coerce-init-generator';
import { InitPublishableGeneratorSchema } from './schema';
import { updateProjectPackageJson } from './update-project-package-json';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {
  console.log(`init publishable library project: ${ projectName }`);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  updateProjectPackageJson(tree, project, projectName, rootPackageJson);
  if (tree.exists('LICENSE')) {
    CoerceFile(tree, join(project.root, 'LICENSE.md'), tree.read('LICENSE')!);
    CoerceFile(tree, join(project.root, 'LICENSE'), tree.read('LICENSE')!);
  } else {
    console.warn('no LICENSE file found in the workspace root');
  }

  if (IsRxapRepository(tree)) {
    const rxapProject = GetProject(tree, 'rxap');
    rxapProject.implicitDependencies ??= [];
    rxapProject.implicitDependencies.push(projectName);
    rxapProject.implicitDependencies = rxapProject.implicitDependencies.filter(unique());
  }

  await CoerceInitGenerator(tree, projectName, project, options);

  if (projectName !== 'rxap') {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files'),
      target: project.root,
      overwrite: options.overwrite,
    });
    CoerceFile(tree, join(project.root, 'CHANGELOG.md'));
    CoerceFile(tree, join(project.root, 'GETSTARTED.md'));
    CoerceFile(tree, join(project.root, 'GUIDES.md'));
  }

}
