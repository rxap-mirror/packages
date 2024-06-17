import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  GenerateSerializedSchematicFile,
  GetNxVersion,
} from '@rxap/workspace-utilities';
import { initWorkspace } from './init-workspace';
import { InitGeneratorSchema } from './schema';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('storybook init generator:', options);

  await AddPackageJsonDevDependency(tree, '@nx/storybook', GetNxVersion(tree), { soft: true });

  await initWorkspace(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-storybook',
    'init',
    DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
