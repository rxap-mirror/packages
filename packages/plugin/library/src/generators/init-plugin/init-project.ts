import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitPluginGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPluginGeneratorSchema) {
  console.log(`init plugin library project: ${ projectName }`);

  updatePackageJson(tree, projectName, project);

}
