import {
  installPackagesTask,
  Tree,
} from '@nx/devkit';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { WorkspaceInitGenerator } from '@rxap/plugin-workspace';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const {
    packages,
    standalone,
    license,
    repositoryUrl,
    prefix,
  } = options;
  await WorkspaceInitGenerator(tree, {
    packages,
    standalone,
    license,
    repositoryUrl,
    overwrite: true,
  });
  await AngularInitGenerator(tree, {
    prefix,
    overwrite: true,
  });

  installPackagesTask(tree, true);
}

export default presetGenerator;
