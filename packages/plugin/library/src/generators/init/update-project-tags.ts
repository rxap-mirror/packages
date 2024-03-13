import { ProjectConfiguration } from '@nx/devkit';
import { CoerceProjectTags } from '@rxap/generator-utilities';

export function updateProjectTags(project: ProjectConfiguration) {
  const tags: string[] = project.root.split('/').filter(Boolean);
  const projectName = tags.pop(); // remove the last element this is the project name
  if (tags[0] === 'angular') {
    tags.push('ngx');
  }
  if (tags[0] === 'nest') {
    tags.push('nestjs');
  }
  CoerceProjectTags(project, tags);
  // if the tag list does not include the project name
  if (projectName && !tags.includes(projectName) && project.tags) {
    // then remove the project name from the tags if it is included
    project.tags = project.tags.filter(tag => tag !== projectName);
  }
}
