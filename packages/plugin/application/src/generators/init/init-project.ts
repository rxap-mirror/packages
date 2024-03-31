import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitGeneratorSchema } from './schema';
import { updateJestConfig } from './update-jest-config';
import { updateProjectTargets } from './update-project-targets';
import { updateTags } from './update-tags';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {
  console.log(`init application project: ${ projectName }`);

  updateTags(project, options);

  updateProjectTargets(project, projectName, options);

  updateJestConfig(tree, project, projectName, options);
}
