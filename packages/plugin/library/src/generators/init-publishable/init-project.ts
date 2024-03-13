import {
  ProjectConfiguration,
  readJson,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  CoerceIgnorePattern,
} from '@rxap/generator-utilities';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { CoerceFilesStructure } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitPublishableGeneratorSchema } from './schema';
import { updateProjectPackageJson } from './update-project-package-json';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPublishableGeneratorSchema) {
  console.log(`init publishable library project: ${ projectName }`);

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  updateProjectTargets(project);
  updateProjectPackageJson(tree, project, projectName, rootPackageJson);
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: project.root,
    overwrite: options.overwrite,
  });
  CoerceFile(tree, join(project.root, 'CHANGELOG.md'));
  CoerceFile(tree, join(project.root, 'GETSTARTED.md'));
  CoerceFile(tree, join(project.root, 'GUIDES.md'));
  if (tree.exists('LICENSE')) {
    CoerceFile(tree, join(project.root, 'LICENSE.md'), tree.read('LICENSE')!);
    CoerceFile(tree, join(project.root, 'LICENSE'), tree.read('LICENSE')!);
  } else {
    console.warn('no LICENSE file found in the workspace root');
  }
  CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'README.md' ]);

}
