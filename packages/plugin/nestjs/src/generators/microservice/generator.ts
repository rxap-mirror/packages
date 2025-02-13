import {
  readNxJson,
  Tree,
} from '@nx/devkit';
import { applicationGenerator } from '@nx/nest';
import {
  CoerceArrayItems,
  CoercePrefix,
  dasherize,
} from '@rxap/utilities';
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

  name = CoercePrefix(dasherize(name), 'service-');
  directory ??= join('service', name.replace(/(^service-)/, ''));

  presetOptions.tags ??= '';
  const tags = (presetOptions.tags as string).split(',').map(tag => tag.trim());
  CoerceArrayItems(tags, ['nest', 'service']);
  presetOptions.tags = tags.join(',');

  console.log('Generate nest application'.cyan);
  console.log('name: ' + name.magenta);
  console.log('directory: ' + directory.magenta);
  console.log('tags: ' + tags.join(', ').magenta);

  await applicationGenerator(tree, {
    ...presetOptions,
    name,
    directory,
  });

  const projectName = name;

  await initApplicationGenerator(tree, {
    generateMain: true,
    ...options,
    project: projectName,
  } as any);

  console.log(`run the application init generator: nx g @rxap/plugin-application:init --project ${ projectName }`);

}

export default microserviceGenerator;
