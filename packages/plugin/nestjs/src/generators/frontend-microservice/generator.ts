import {
  readNxJson,
  Tree,
} from '@nx/devkit';
import microserviceGenerator from '../microservice/generator';
import { FrontendMicroserviceGeneratorSchema } from './schema';

export async function frontendMicroserviceGenerator(
  tree: Tree,
  options: FrontendMicroserviceGeneratorSchema,
) {

  const nxJson = readNxJson(tree);
  if (!nxJson) {
    throw new Error('No nx.json found');
  }
  const presetOptions = nxJson.generators?.['@rxap/plugin-nestjs:microservice'] ?? {};

  await microserviceGenerator(tree, {
    ...presetOptions,
    apiPrefix: [ 'api', 'app', options.frontend, options.feature ].join('/'),
    ...options,
    name: options.feature,
    directory: [ 'service', 'app', options.frontend ].join('/'),
  });

}

export default frontendMicroserviceGenerator;
