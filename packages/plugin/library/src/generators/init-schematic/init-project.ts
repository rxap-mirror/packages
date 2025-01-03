import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitSchematicGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitSchematicGeneratorSchema) {
  console.log(`init plugin library project: ${ projectName }`);

  updatePackageJson(tree, projectName, project);

}
