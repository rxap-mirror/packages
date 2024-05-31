import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  HasMigrations,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitWithMigrationsGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitWithMigrationsGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!HasMigrations(tree, { name: projectName })) {
    return true;
  }

  return false;

}

export async function initWithMigrationsGenerator(
  tree: Tree,
  options: InitWithMigrationsGeneratorSchema
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('with migration library init generator:', options);

  initWorkspace(tree, options);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      await initProject(tree, projectName, project, options);

      updateProjectConfiguration(tree, projectName, project);

    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initWithMigrationsGenerator;
