import { Tree } from '@nx/devkit';
import { AddPackageJsonDevDependency } from '@rxap/workspace-utilities';

export async function addPackageDependencies(tree: Tree) {
  await AddPackageJsonDevDependency(tree, 'rxap', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, 'husky', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, 'nx-cloud', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/cli', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@commitlint/config-conventional', 'latest', { soft: true });
}
