import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceTarget,
  DeleteTarget,
  IsGeneratorProject,
  IsPluginProject,
  IsPresetProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitGeneratorSchema) {

  if (options.targets?.indexExport === false|| IsPresetProject(project) || IsPluginProject(project) || IsGeneratorProject(project) || IsSchematicProject(project)) {
    DeleteTarget(project, 'index-export');
  } else {
    CoerceTarget(project, 'index-export', {});
  }

}
