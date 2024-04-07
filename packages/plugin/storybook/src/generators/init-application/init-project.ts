import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { coerceStorybook } from '../../lib/coerce-storybook';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init storybook application project: ${ projectName }`);

  await coerceStorybook(tree, projectName, options);

}
