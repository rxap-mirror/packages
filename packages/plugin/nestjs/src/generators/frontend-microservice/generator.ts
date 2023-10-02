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
  const presetOptions = nxJson.generators?.['@rxap/plugin-nestjs:microservice'] ?? {};

  await microserviceGenerator(tree, {
    ...presetOptions,
    name: options.feature,
    directory: [ 'service', 'app', options.frontend ].join('/'),
  });

}

export default frontendMicroserviceGenerator;
