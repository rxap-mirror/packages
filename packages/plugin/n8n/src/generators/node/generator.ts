import { Tree } from '@nx/devkit';
import { createNodeJson } from './create-node-json';
import { createNodeTs } from './create-node-ts';
import { NodeGeneratorSchema } from './schema';

export async function nodeGenerator(tree: Tree, { project, name, nodeNamePrefix = 'rxap', description = name }: NodeGeneratorSchema) {
  createNodeJson(tree, project, name, nodeNamePrefix);
  createNodeTs(tree, project, name, nodeNamePrefix, description);
}

export default nodeGenerator;
