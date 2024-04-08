import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { SkipNonPublishableProject } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from '../init/schema';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitPublishableGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonPublishableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initPublishableGenerator(
  tree: Tree,
  options: InitPublishableGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('publishable library init generator:', options);

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

}

export default initPublishableGenerator;
