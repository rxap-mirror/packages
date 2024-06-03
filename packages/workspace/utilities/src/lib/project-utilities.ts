import { HasProject } from './get-project';
import { TreeLike } from './tree';


export interface BuildNestProjectNameOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  backend?: { project?: string } & Record<string, unknown>;
}

export function buildNestProjectName(options: BuildNestProjectNameOptions) {
  if (options.backend?.project) {
    return options.backend.project;
  }
  const project = options.project.replace(/user-interface-/, '');
  if (options.feature) {
    if (options.shared) {
      return `service-feature-${ options.feature }`;
    } else {
      return `service-app-${ project }-${ options.feature }`;
    }
  } else {
    return project;
  }
}

export function buildNestProjectDirectoryPath(options: BuildNestProjectNameOptions) {
  if (options.backend?.project) {
    throw new Error(`The backend project is explicitly specified. Ensure the project '${options.backend.project}' does exists`);
  }
  const project = options.project.replace(/user-interface-/, '');
  const fragments = [ 'service' ];
  if (options.feature) {
    if (options.shared) {
      fragments.push('feature', options.feature);
    } else {
      fragments.push('app', project, options.feature);
    }
  } else {
    fragments.push(project);
  }
  return fragments.join('/');
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
