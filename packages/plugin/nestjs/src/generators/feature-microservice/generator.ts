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
  const presetOptions = nxJson.generators?.['@rxap/plugin-nestjs:microservice'] ?? {};

  await microserviceGenerator(tree, {
    ...presetOptions,
    apiPrefix: [ 'api', 'feature', options.feature ].join('/'),
    ...options,
    name: options.feature,
    directory: [ 'service', 'feature' ].join('/'),
  });

}

export default featureMicroserviceGenerator;
