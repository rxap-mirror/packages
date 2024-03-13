import { Tree } from '@nx/devkit';
import { initWorkspace as initBuildableWorkspace } from '../init-buildable/init-workspace';
import { initWorkspace as initPluginWorkspace } from '../init-plugin/init-workspace';
import { initWorkspace as initPublishableWorkspace } from '../init-publishable/init-workspace';
import { InitGeneratorSchema } from './schema';
import { updateDefaultProjectTargets } from './update-default-project-targets';

export function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init library workspace');

  updateDefaultProjectTargets(tree);

  initBuildableWorkspace(tree, options);
  initPublishableWorkspace(tree, options);
  initPluginWorkspace(tree, options);
}
