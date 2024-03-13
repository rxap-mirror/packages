import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonLibraryProject } from '@rxap/generator-utilities';
import { IsPluginProject } from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitPluginGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitPluginGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!IsPluginProject(project)) {
    return true;
  }

  return false;

}

export async function initPluginGenerator(
  tree: Tree,
  options: InitPluginGeneratorSchema,
) {
  console.log('plugin library init generator:', options);

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

}

export default initPluginGenerator;
