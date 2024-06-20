import {
  formatFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import { GenerateSerializedSchematicFile } from '@rxap/workspace-utilities';
import { CoerceGitIgnore } from '../../lib/coerce-git-ignore';
import { CoerceTypedocTarget } from '../../lib/coerce-typedoc-target';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('typedoc init generator:', options);

  await initWorkspace(tree, options);

  const project = readProjectConfiguration(tree, 'workspace');
  CoerceTypedocTarget(tree, 'workspace', project);
  CoerceGitIgnore(tree, 'workspace');
  updateProjectConfiguration(tree, 'workspace', project);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-typedoc',
    'init',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default initGenerator;
