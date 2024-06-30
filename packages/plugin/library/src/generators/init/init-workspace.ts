import { Tree } from '@nx/devkit';
import { IsAlreadyExecuted } from '@rxap/workspace-utilities';
import { initWorkspace as initBuildableWorkspace } from '../init-buildable/init-workspace';
import { initWorkspace as initPluginWorkspace } from '../init-plugin/init-workspace';
import { initWorkspace as initPresetWorkspace } from '../init-preset/init-workspace';
import { initWorkspace as initPublishableWorkspace } from '../init-publishable/init-workspace';
import { initWorkspace as initSchematicWorkspace } from '../init-schematic/init-workspace';
import { initWorkspace as initWithMigrationWorkspace } from '../init-with-migrations/init-workspace';
import { InitGeneratorSchema } from './schema';
import { updateDefaultProjectTargets } from './update-default-project-targets';

export function initWorkspace(tree: Tree, options: InitGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init library workspace');

  updateDefaultProjectTargets(tree);

  initBuildableWorkspace(tree, options);
  initPublishableWorkspace(tree, options);
  initPluginWorkspace(tree, options);
  initSchematicWorkspace(tree, options);
  initPresetWorkspace(tree, options);
  initWithMigrationWorkspace(tree, options);
}
