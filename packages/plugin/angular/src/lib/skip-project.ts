import { SkipProject } from '@rxap/generator-utilities';

export function SkipNonAngularProject(tree, options, project, projectName) {
  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }
  if (!project.tags?.includes('angular') && !project.tags?.includes('ngx')) {
    return true;
  }
  if (project.tags?.includes('plugin') || project.tags?.includes('schematic')) {
    return true;
  }
  return false;
}
