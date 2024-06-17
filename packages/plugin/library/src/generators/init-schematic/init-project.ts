import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitSchematicGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';
import { updateProjectTargets } from './update-project-targets';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitSchematicGeneratorSchema) {
  console.log(`init plugin library project: ${ projectName }`);

  updateProjectTargets(tree, project, options);

  updatePackageJson(tree, projectName, project);

}
