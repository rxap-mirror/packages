import { HasProject } from '@rxap/schematics-utilities';
import { Tree } from '@angular-devkit/schematics';


export function buildNestProjectName(options: { project: string, feature?: string, shared?: boolean }) {
  if (options.feature) {
    if (options.shared) {
      return `service-feature-${ options.feature }`;
    } else {
      return `service-app-${ options.project }-${ options.feature }`;
    }
  } else {
    return options.project;
  }
}


export function HasNestServiceProject(tree: Tree, options: { project: string, feature?: string, shared?: boolean }) {
  const projectName = buildNestProjectName(options);
  return HasProject(tree, projectName);
}
