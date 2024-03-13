import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonBuildableProject } from '@rxap/generator-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitBuildableGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitBuildableGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonBuildableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initBuildableGenerator(
  tree: Tree,
  options: InitBuildableGeneratorSchema,
) {
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
}

export default initBuildableGenerator;
