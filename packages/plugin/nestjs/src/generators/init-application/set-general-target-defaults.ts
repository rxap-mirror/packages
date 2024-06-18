import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import {
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export function setGeneralTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  console.log('updating default targets');

  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  if (!options.standalone) {
    CoerceTargetDefaultsDependency(nxJson, 'build', 'generate-package-json');
    CoerceNxJsonCacheableOperation(
      nxJson, 'generate-package-json', 'generate-open-api');
    CoerceTarget(nxJson, 'generate-package-json', {
      executor: '@rxap/plugin-nestjs:package-json',
      configurations: {
        production: {},
      },
    });
    CoerceTargetDefaultsDependency(nxJson, 'generate-open-api', 'swagger-generate');
    CoerceTargetDefaultsDependency(nxJson, 'test', '^generate-open-api');
  }

  updateNxJson(tree, nxJson);
}
