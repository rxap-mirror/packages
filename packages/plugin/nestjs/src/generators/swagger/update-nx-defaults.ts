import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { SwaggerGeneratorSchema } from './schema';

export function updateNxDefaults(tree: Tree, options: SwaggerGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  updateNxJson(tree, nxJson);
}
