import { Tree } from '@nx/devkit';
import { WorkspaceInitGenerator } from '@rxap/plugin-workspace';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  await WorkspaceInitGenerator(tree, {
    ...options,
    overwrite: false,
    skipFormat: false,
    skipProjects: false,
  });
}

export default presetGenerator;
