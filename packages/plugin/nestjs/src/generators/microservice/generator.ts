import {
  readNxJson,
  Tree,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';
import initApplicationGenerator from '../init-application/generator';
import { MicroserviceGeneratorSchema } from './schema';

export async function microserviceGenerator(
  tree: Tree,
  options: MicroserviceGeneratorSchema,
) {

  const nxJson = readNxJson(tree);
  if (!nxJson) {
    throw new Error('No nx.json found');
  }
  const presetOptions = nxJson.generators?.['@nx/nest:application'] ?? {};

  options.directory ??= 'service';

  presetOptions.tags ??= '';
  if (!presetOptions.tags.includes('nest')) {
    presetOptions.tags += (
                            presetOptions.tags.length ? ',' : ''
                          ) + 'nest';
  }

  await applicationGenerator(tree, {
    ...presetOptions,
    name: options.name,
    directory: options.directory,
  });

  const projectName = [ options.directory.replace(/\//g, '-'), options.name ].filter(Boolean).join('-');

  await initApplicationGenerator(tree, {
    generateMain: true,
    swagger: true,
    healthIndicator: true,
    sentry: true,
    validator: true,
    platform: 'express',
    overwrite: true,
    statusRegister: true,
    ...options,
    projects: [ projectName ],
  });

  console.log(`run the application init generator: nx g @rxap/plugin-application:init --project ${ projectName }`);

}

export default microserviceGenerator;
