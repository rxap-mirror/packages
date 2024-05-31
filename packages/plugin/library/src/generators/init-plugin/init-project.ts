import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitPluginGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPluginGeneratorSchema) {
  console.log(`init plugin library project: ${ projectName }`);

  updateProjectTargets(tree, project);

  updatePackageJson(tree, projectName, project);

}
