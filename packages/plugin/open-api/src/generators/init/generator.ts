import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { GenerateSerializedSchematicFile } from '@rxap/workspace-utilities';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('compodoc init generator:', options);

  await initWorkspace(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-compodoc',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initGenerator;
