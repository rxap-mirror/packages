import { Tree } from '@angular-devkit/schematics';
import { HasProject } from '@rxap/schematics-utilities';


/**
 * @deprecated import from @rxap/workspace-utilities
 */
export interface BuildNestProjectNameOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

/**
 * @deprecated import from @rxap/workspace-utilities
 */
export function buildNestProjectName(options: BuildNestProjectNameOptions) {
  if (options.feature) {
    if (options.shared) {
      return `service-feature-${ options.feature }`;
    } else {
      return `service-app-${ options.project.replace(/user-interface-/, '') }-${ options.feature }`;
    }
  } else {
    return options.project;
  }
}

/**
 * @deprecated import from @rxap/workspace-utilities
 */
export interface HasNestServiceProjectOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

/**
 * @deprecated import from @rxap/workspace-utilities
 */
export function HasNestServiceProject(tree: Tree, options: HasNestServiceProjectOptions) {
  const projectName = buildNestProjectName(options);
  return HasProject(tree, projectName);
}
