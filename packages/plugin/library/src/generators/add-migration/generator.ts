import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { migrationGenerator } from '@nx/plugin/generators';
import { dasherize } from '@rxap/utilities';
import { GetProjectRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import * as path from 'path';
import { initProject } from '../init-with-migrations/init-project';
import { initWorkspace } from '../init-with-migrations/init-workspace';
import { AddMigrationGeneratorSchema } from './schema';

export async function addMigrationGenerator(
  tree: Tree,
  options: AddMigrationGeneratorSchema
) {

  const projectRoot = GetProjectRoot(tree, options.project);
  const majorVersion = options.packageVersion.split('.')[0];
  const migrationRoot = join(projectRoot, 'src', 'migrations', `${majorVersion}.0.0`, dasherize(options.name));

  const generatorOptions = { project: options.project, projects: [options.project] };
  initWorkspace(tree, generatorOptions);

  await migrationGenerator(tree, {
    name: options.name,
    packageVersion: options.packageVersion,
    packageJsonUpdates: options.packageJsonUpdates,
    description: options.description,
    directory: migrationRoot,
    nameAndDirectoryFormat: 'as-provided'
  });

  initProject(tree, options.project, readProjectConfiguration(tree, options.project), generatorOptions);

}

export default addMigrationGenerator;
