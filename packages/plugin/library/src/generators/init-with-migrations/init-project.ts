import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetProjectRoot,
  UpdateJsonFile,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitWithMigrationsGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitWithMigrationsGeneratorSchema) {
  console.log(`init library with migration project: ${ projectName }`);

  const projectRoot = GetProjectRoot(tree, projectName);

  // ensure the migrations.json file exists and is configured correctly
  UpdateJsonFile(tree, migrations => {
    migrations.generators ??= {};
  }, join(projectRoot, 'migrations.json'), { create: true });

  updateProjectTargets(tree, projectName, project);

  updatePackageJson(tree, projectName, project);

}
