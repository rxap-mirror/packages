import { Tree } from '@nx/devkit';
import { AddPackageJsonDevDependency } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function addPackageDependencies(tree: Tree, options: InitGeneratorSchema) {
  await AddPackageJsonDevDependency(tree, 'rxap', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/cli', 'latest', { soft: true });
  if (options.withHusky) {
    await AddPackageJsonDevDependency(tree, 'husky', 'latest', { soft: true });
  }
  await AddPackageJsonDevDependency(tree, 'nx-cloud', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/cli', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/config-conventional', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/schematic-composer', 'latest', { soft: true });
}
