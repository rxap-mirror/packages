import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitBuildableGeneratorSchema } from './schema';
import { syncProjectNameWithTsConfigPaths } from './sync-project-name-with-ts-config-paths';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitBuildableGeneratorSchema) {
  console.log(`init buildable library project: ${ projectName }`);

  updateProjectTargets(project, options);
  syncProjectNameWithTsConfigPaths(tree, projectName);

}
