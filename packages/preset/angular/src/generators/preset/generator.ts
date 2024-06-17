import { Tree } from '@nx/devkit';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { WorkspaceInitGenerator } from '@rxap/plugin-workspace';
import { AddPackageJsonDevDependency } from '@rxap/workspace-utilities';
import { PresetGeneratorSchema } from './schema';
import { join } from 'path';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const packageJsonFilePath = join(__dirname, '..', '..', 'package.json');
  console.log('packageJsonFilePath:', packageJsonFilePath);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { dependencies } = require(packageJsonFilePath);
  console.log('dependencies:', JSON.stringify(dependencies));
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-angular', dependencies['@rxap/plugin-angular']);
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-workspace', dependencies['@rxap/plugin-workspace']);
  await WorkspaceInitGenerator(tree, {
    ...options,
    overwrite: false,
    skipFormat: false,
    skipProjects: false,
  });
  await AngularInitGenerator(tree, {
    ...options,
    overwrite: false,
    skipFormat: false,
    skipProjects: false,
  });
}

export default presetGenerator;
