import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('storybook init generator:', options);

  await initWorkspace(tree, options);

}

export default initGenerator;
