import { Tree } from '@nx/devkit';
import { AddPackageJsonDevDependency } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init storybook workspace');

  await AddPackageJsonDevDependency(tree, '@compodoc/compodoc', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@storybook/addon-themes', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@storybook/addon-interactions', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@storybook/addon-themes', 'latest', { soft: true });

}
