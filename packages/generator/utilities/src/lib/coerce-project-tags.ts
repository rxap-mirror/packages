import { ProjectConfiguration } from '@nx/devkit';

export function CoerceProjectTags(project: ProjectConfiguration, tags: string[]) {
  project.tags ??= [];
  project.tags.push(...tags);
  project.tags = [ ...new Set(project.tags) ];
}
