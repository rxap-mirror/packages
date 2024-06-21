import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  IsPresetProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { InitPluginGeneratorSchema } from '../init-plugin/schema';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitPresetGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitPluginGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsPresetProject(project)) {
    return true;
  }

  return false;

}

export async function initPresetGenerator(
  tree: Tree,
  options: InitPresetGeneratorSchema
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('preset library init generator:', options);

  initWorkspace(tree, options);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      initProject(tree, projectName, project, options);

      updateProjectConfiguration(tree, projectName, project);

    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initPresetGenerator;
