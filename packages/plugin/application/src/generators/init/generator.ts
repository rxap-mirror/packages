import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonApplicationProject } from '@rxap/generator-utilities';
import { DockerGitlabCiGenerator } from '@rxap/plugin-docker';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {
  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;
}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.overwrite ??= false;
  options.skipProjects ??= false;
  options.authentik ??= false;
  options.minio ??= false;
  console.log('application init generator:', options);

  await initWorkspace(tree, options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!options.skipProjects) {
      initProject(project, projectName, options);

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }

  }

  await DockerGitlabCiGenerator(tree, {});

}

export default initGenerator;
