import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceTarget,
  DeleteTarget,
  IsGeneratorProject,
  IsPluginProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitGeneratorSchema) {

  if (options.targets?.indexExport !== false && !IsPluginProject(project) && !IsGeneratorProject(project) && !IsSchematicProject(project)) {
    CoerceTarget(project, 'index-export', {});
  } else if (options.targets?.indexExport === false) {
    DeleteTarget(project, 'index-export');
  } else {
    console.log('skip index-export target for plugin, generator or schematic project'.yellow);
  }

}
