import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init cypress application project: ${ projectName }`);


}
