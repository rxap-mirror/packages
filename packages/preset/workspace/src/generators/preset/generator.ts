import {
  installPackagesTask,
  Tree,
} from '@nx/devkit';
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
  } = options;
  await WorkspaceInitGenerator(tree, {
    packages,
    standalone,
    license,
    repositoryUrl,
    overwrite: true,
  });
  if (!options.skipInstall) {
    installPackagesTask(tree, true);
  }
}

export default presetGenerator;
