import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { initProject as libraryInitProject } from '../init-library/init-project';
import { InitApplicationGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  console.log(`init storybook application project: ${ projectName }`);

  await libraryInitProject(tree, projectName, project, options as any);

}
