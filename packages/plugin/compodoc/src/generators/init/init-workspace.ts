import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init compodoc workspace');

  await AddPackageJsonDevDependency(tree, '@compodoc/compodoc', 'latest', { soft: true });

  const nxJson = readNxJson(tree);

  CoerceTarget(nxJson, 'compodoc', {
    executor: '@rxap/plugin-compodoc:build',
    defaultConfiguration: 'html',
    outputs: [ '{options.outputPath}' ],
    inputs: [ 'production', '^production' ],
    configurations: {
      json: {
        exportFormat: 'json',
      },
      html: {
        exportFormat: 'html',
      },
    },
  });
  CoerceNxJsonCacheableOperation(nxJson, 'compodoc');

  updateNxJson(tree, nxJson);

}
