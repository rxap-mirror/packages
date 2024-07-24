import {
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { migrationGenerator } from '@nx/plugin/generators';
import { dasherize } from '@rxap/utilities';
import {
  GetProjectPackageJson,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { initProject } from '../init-with-migrations/init-project';
import { initWorkspace } from '../init-with-migrations/init-workspace';
import { AddMigrationGeneratorSchema } from './schema';
import { inc } from 'semver';

export async function addMigrationGenerator(
  tree: Tree,
  options: AddMigrationGeneratorSchema
) {

  if (!options.packageVersion && !options.increment) {
    throw new Error('You must provide either a package version or an increment');
  }

  let packageVersion = options.packageVersion;
  if (!packageVersion) {
    const projectPackageJson = GetProjectPackageJson(tree, options.project);
    const currentVersion = projectPackageJson.version!;
    const normalizedVersion = currentVersion.replace(/-\w+\.\d+/, '');
    packageVersion = inc(normalizedVersion, options.increment!)!;
    if (!packageVersion) {
      throw new Error(`Invalid increment "${options.increment}" for version "${normalizedVersion}"`);
    }
  }

  const projectRoot = GetProjectRoot(tree, options.project);
  const majorVersion = packageVersion.split('.')[0];
  const migrationRoot = join(projectRoot, 'src', 'migrations', `${majorVersion}.0.0`, dasherize(options.name));

  const generatorOptions = { project: options.project, projects: [options.project] };
  initWorkspace(tree, generatorOptions);

  await migrationGenerator(tree, {
    name: options.name,
    packageVersion,
    packageJsonUpdates: options.packageJsonUpdates,
    description: options.description,
    directory: migrationRoot,
    nameAndDirectoryFormat: 'as-provided'
  });

  initProject(tree, options.project, readProjectConfiguration(tree, options.project), generatorOptions);

}

export default addMigrationGenerator;
