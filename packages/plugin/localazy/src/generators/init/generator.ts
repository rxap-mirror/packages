import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  GenerateSerializedSchematicFile,
} from '@rxap/workspace-utilities';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('localazy init generator:', options);

  await initWorkspace(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-localazy',
    'init',
    options,
  );

  await AddPackageJsonDevDependency(tree, '@localazy/cli', 'latest', { soft: true });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
