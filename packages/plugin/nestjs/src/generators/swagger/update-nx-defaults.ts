import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { SwaggerGeneratorSchema } from './schema';

export function updateNxDefaults(tree: Tree, options: SwaggerGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceNxJsonCacheableOperation(nxJson, 'swagger-build', 'swagger-generate');

  CoerceTarget(nxJson, 'swagger-generate', {
    executor: '@rxap/plugin-nestjs:swagger-generate',
    'dependsOn': [
      'swagger-build',
    ],
  }, Strategy.REPLACE);

  CoerceTarget(nxJson, 'swagger-build', {
    executor: '@nx/webpack:webpack',
    outputs: [
      '{options.outputPath}',
    ],
    options: {
      transformers: [
        '@nestjs/swagger/plugin',
      ],
      compiler: 'tsc',
      target: 'node',
      deleteOutputPath: false,
    },
    inputs: [
      'build',
      '^build',
    ],
    dependsOn: [
      '^build',
    ],
  }, Strategy.OVERWRITE);

  updateNxJson(tree, nxJson);
}
