import {
  readNxJson,
  Tree,
} from '@nx/devkit';
import microserviceGenerator from '../microservice/generator';
import { FeatureMicroserviceGeneratorSchema } from './schema';

export async function featureMicroserviceGenerator(
  tree: Tree,
  options: FeatureMicroserviceGeneratorSchema,
) {

  const nxJson = readNxJson(tree);
  if (!nxJson) {
    throw new Error('No nx.json found');
  }
  const presetOptions = nxJson.generators?.['@rxap/plugin-nestjs:microservice'] ?? {};

  await microserviceGenerator(tree, {
    ...presetOptions,
    apiPrefix: [ 'api', 'feature', options.feature ].join('/'),
    ...options,
    name: [ 'service', 'feature', options.feature ].join('-'),
    directory: [ 'service', 'feature', options.feature ].join('/'),
  } as any);

}

export default featureMicroserviceGenerator;
