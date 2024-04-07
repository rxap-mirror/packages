import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { coerceStorybook } from '../../lib/coerce-storybook';
import { InitLibraryGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init storybook library project: ${ projectName }`);

  await coerceStorybook(tree, projectName, options);

}
