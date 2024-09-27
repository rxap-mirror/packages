import { ProjectConfiguration } from '@nx/devkit';
import { CoerceProjectTags } from '@rxap/workspace-utilities';

export function updateProjectTags(project: ProjectConfiguration) {
  CoerceProjectTags(project, ['n8n']);
}
