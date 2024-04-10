import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { IsApplicationProject } from '@rxap/workspace-utilities';
import { DockerGeneratorSchema } from './schema';

export function skipProject(
  tree: Tree, options: DockerGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (!IsApplicationProject(project)) {
    return true;
  }

  if (!project.targets?.['docker']) {
    console.warn(`The project '${ projectName }' has no docker target`);
    return true;
  }

  return false;

}
