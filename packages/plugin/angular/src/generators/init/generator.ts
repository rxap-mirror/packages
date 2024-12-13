import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import { GenerateSerializedSchematicFile } from '@rxap/workspace-utilities';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('angular init generator:', options);

  await initWorkspace(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-angular',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
