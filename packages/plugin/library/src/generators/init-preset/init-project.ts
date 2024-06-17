import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitPresetGeneratorSchema } from './schema';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPresetGeneratorSchema) {
  console.log(`init preset library project: ${ projectName }`);

  updateProjectTargets(tree, project);

}
