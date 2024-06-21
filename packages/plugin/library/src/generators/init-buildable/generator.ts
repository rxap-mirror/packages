import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { SkipNonBuildableProject } from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitBuildableGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitBuildableGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonBuildableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initBuildableGenerator(
  tree: Tree,
  options: InitBuildableGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('buildable library init generator:', options);

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

export default initBuildableGenerator;
