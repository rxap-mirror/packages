import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { DockerGeneratorSchema } from './schema';

export function skipProject(
  tree: Tree, options: DockerGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (!project.targets?.['docker']) {
    console.warn(`The project '${ projectName }' has no docker target`);
    return true;
  }

  return false;

}
