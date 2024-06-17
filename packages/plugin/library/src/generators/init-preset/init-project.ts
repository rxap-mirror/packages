import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { InitPresetGeneratorSchema } from './schema';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitPresetGeneratorSchema) {
  console.log(`init preset library project: ${ projectName }`);

}
