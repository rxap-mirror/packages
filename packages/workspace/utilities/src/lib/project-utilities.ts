import { HasProject } from './get-project';
import { TreeLike } from './tree';


export interface BuildNestProjectNameOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

export function buildNestProjectName(options: BuildNestProjectNameOptions) {
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

export interface HasNestServiceProjectOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

export function HasNestServiceProject<Tree extends TreeLike>(tree: Tree, options: HasNestServiceProjectOptions) {
  const projectName = buildNestProjectName(options);
  return HasProject(tree, projectName);
}
