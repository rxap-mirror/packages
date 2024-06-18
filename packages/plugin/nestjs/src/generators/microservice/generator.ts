import {
  readNxJson,
  Tree,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';
import { dasherize } from '@rxap/utilities';
import { join } from 'path';
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

  let { directory, name } = options;

  name = dasherize(name);
  directory ??= join('service', name);

  presetOptions.tags ??= '';
  if (!presetOptions.tags.includes('nest')) {
    presetOptions.tags += (
                            presetOptions.tags.length ? ',' : ''
                          ) + 'nest';
  }

  console.log('Generate nest application'.cyan);
  console.log('name: ' + name.magenta);
  console.log('directory: ' + directory.magenta);

  await applicationGenerator(tree, {
    ...presetOptions,
    projectNameAndRootFormat: 'as-provided',
    name,
    directory,
  });

  const projectName = name;

  await initApplicationGenerator(tree, {
    generateMain: true,
    ...options,
    project: projectName,
  });

  console.log(`run the application init generator: nx g @rxap/plugin-application:init --project ${ projectName }`);

}

export default microserviceGenerator;
