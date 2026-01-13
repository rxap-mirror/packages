import { Tree } from '@nx/devkit';
import { createTriggerJson } from './create-trigger-json';
import { createTriggerTs } from './create-trigger-ts';
import { TriggerGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';

export async function nodeGenerator(tree: Tree, { project, name, nodeNamePrefix = 'rxap', description = name }: TriggerGeneratorSchema) {
  createTriggerJson(tree, project, name, nodeNamePrefix);
  await createTriggerTs(tree, project, name, nodeNamePrefix, description);
  updatePackageJson(tree, project, name);
}

export default nodeGenerator;
