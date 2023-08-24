import { Tree } from '@nx/devkit';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { ValidatorGeneratorSchema } from './schema';

export async function validatorGenerator(
  tree: Tree,
  options: ValidatorGeneratorSchema,
) {
  await AddPackageJsonDependency(tree, 'class-validator', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'class-transformer', 'latest', { soft: true });
}

export default validatorGenerator;
