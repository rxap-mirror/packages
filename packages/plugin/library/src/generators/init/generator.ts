import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonLibraryProject } from '@rxap/generator-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';
import 'colors';


function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('library init generator:', options);

  initWorkspace(tree, options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!options.skipProjects) {
      await initProject(tree, projectName, project, options);

      updateProjectConfiguration(tree, projectName, project);
    }

  }

}

export default initGenerator;
