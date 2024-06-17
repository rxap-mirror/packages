import { Tree } from '@nx/devkit';
import { AngularInitGenerator } from '@rxap/plugin-angular';
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
  await AngularInitGenerator(tree, {
    ...options,
    overwrite: false,
    skipFormat: false,
    skipProjects: false,
  });
}

export default presetGenerator;
