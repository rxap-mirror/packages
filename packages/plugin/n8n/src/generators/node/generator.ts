import { Tree } from '@nx/devkit';
import { createNodeJson } from './create-node-json';
import { createNodeTs } from './create-node-ts';
import { NodeGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';

export async function nodeGenerator(tree: Tree, { project, name, nodeNamePrefix = 'rxap', description = name }: NodeGeneratorSchema) {
  createNodeJson(tree, project, name, nodeNamePrefix);
  await createNodeTs(tree, project, name, nodeNamePrefix, description);
  updatePackageJson(tree, project, name);
}

export default nodeGenerator;
