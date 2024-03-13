import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceTarget,
  IsGeneratorProject,
  IsPluginProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';

export function updateProjectTargets(project: ProjectConfiguration) {

  if (!IsPluginProject(project) && !IsGeneratorProject(project) && !IsSchematicProject(project)) {
    CoerceTarget(project, 'index-export', {});
  } else {
    console.log('skip index-export target for plugin, generator or schematic project'.yellow);
  }

}
