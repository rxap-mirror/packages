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

export const NG_PRISM_VERSION = '22.8.0';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.prismProject ??= 'prism-host';
  console.log('ng-prism init generator:', options);

  await AddPackageJsonDevDependency(tree, '@ng-prism/core', NG_PRISM_VERSION, { soft: true });
  await AddPackageJsonDevDependency(tree, '@ng-prism/plugin-jsdoc', NG_PRISM_VERSION, { soft: true });
  await AddPackageJsonDevDependency(tree, 'highlight.js', '^11.12.0', { soft: true });
  await AddPackageJsonDevDependency(tree, 'ngx-highlightjs', '^14.0.1', { soft: true });

  await initWorkspace(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-ng-prism',
    'init',
    { prismProject: options.prismProject },
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
