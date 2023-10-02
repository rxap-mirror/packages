import { SkipProject } from '@rxap/generator-utilities';
import {
  IsAngularProject,
  IsPluginProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';

export function SkipNonAngularProject(tree, options, project, projectName) {
  if (SkipProject(tree, options, project, projectName)) {
    return true;
  }
  if (!IsAngularProject(project)) {
    return true;
  }
  if (IsPluginProject(project) || IsSchematicProject(project)) {
    return true;
  }
  return false;
}
