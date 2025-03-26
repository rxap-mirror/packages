import { join } from 'path';
import { HasProject } from './get-project';
import { TreeLike } from './tree';


export interface BuildNestProjectNameOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  backend: { project?: string | null, kind?: any } | undefined;
}

/**
 * Constructs a project name for a NestJS application based on the provided options.
 *
 * The function determines the project name using a set of conditions:
 * - If a backend project name is specified in the options, it returns that name directly.
 * - Otherwise, it strips the prefix "user-interface-" from the `project` option.
 * - If a `feature` is specified:
 * - If `shared` is true, it constructs the name in the format `service-feature-{feature}`.
 * - If `shared` is false, it constructs the name in the format `service-app-{project}-{feature}`.
 * - If no `feature` is specified, it returns the modified `project` name.
 *
 * @param {BuildNestProjectNameOptions} options - The options for building the project name, which include:
 * - `project`: The base name of the project.
 * - `backend`: Optional. Contains the `project` name if a specific backend project name is to be used.
 * - `feature`: Optional. A specific feature within the project, influencing the final project name.
 * - `shared`: Optional. A boolean indicating whether the feature is shared across different parts of the application.
 * @returns {string} The constructed project name based on the provided options.
 */
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

export interface BuildOperationServerIdOptions extends BuildNestProjectNameOptions {
  backend: { project?: string | null, kind?: any, serverId?: string | null } | undefined;
}

export function buildOperationServerId(options: BuildOperationServerIdOptions) {
  if (options.backend?.serverId) {
    return options.backend.serverId;
  }
  return buildNestProjectName(options);
}

/**
 * Constructs a directory path for a NestJS project based on the provided options.
 *
 * This function dynamically builds a directory path string for a NestJS project by analyzing the provided options.
 * It supports differentiating between backend service projects and user-interface projects, and can handle
 * projects with features, both shared and specific.
 *
 * ### Usage
 * - For backend projects, the project name should start with `service-`. If it also includes `feature-`, the function
 * will further categorize the directory structure.
 * - For user-interface projects, the project name should start with `user-interface-`, and can optionally include
 * feature specifications.
 *
 * ### Error Handling
 * - Throws an error if the backend project name does not start with `service-` but is specified, indicating a potential
 * misconfiguration or typo in the project name.
 *
 * ### Parameters
 * - `options`: An object of type `BuildNestProjectNameOptions` containing the following properties:
 * - `backend`: (optional) An object that may contain a `project` string specifying the backend project name.
 * - `project`: A string specifying the main project name, typically for user-interface projects.
 * - `feature`: (optional) A string specifying the feature name within the project.
 * - `shared`: (optional) A boolean indicating whether the feature is shared across different parts of the project.
 *
 * ### Returns
 * - A string representing the constructed directory path based on the specified options.
 *
 * ### Example
 *
 * const options = {
 * backend: { project: 'service-feature-payment' },
 * project: 'user-interface-main',
 * feature: 'checkout',
 * shared: true
 * };
 * const path = buildNestProjectDirectoryPath(options);
 * console.log(path); // Outputs: "service/feature/payment"
 * ```
 */
export function buildNestProjectDirectoryPath(options: BuildNestProjectNameOptions) {
  if (options.backend?.project) {
    const projectName = options.backend.project;
    if (projectName.startsWith('service-')) {
      const prefix = ['service'];
      let directory = projectName.replace(/^service-/, '');
      if (directory.startsWith('feature-')) {
        prefix.push('feature');
        directory = directory.replace(/^feature-/ , '');
      }
      return join(...prefix, directory);
    } else {
      throw new Error(
        `The backend project is explicitly specified. Ensure the project '${ options.backend.project }' does exists`);
    }
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
  backend: { project?: string | null, kind?: any } | undefined;
}

/**
 * Checks if a NestJS project exists within a given tree structure.
 *
 * This function determines whether a specific NestJS project, defined by the options provided, exists within the tree-like structure passed as an argument. It constructs the project name using the provided options and then delegates the existence check to another function.
 *
 * @param {Tree} tree - The tree-like structure to search within. This structure should conform to the TreeLike interface, which abstracts the details of tree traversal and manipulation.
 * @param {HasNestServiceProjectOptions} options - Configuration options used to define the NestJS project name. These options should include all necessary parameters required by `buildNestProjectName` to construct the correct project name.
 * @returns {boolean} Returns `true` if the project exists within the tree, otherwise `false`.
 *
 * @template Tree - A generic type that extends TreeLike, representing the structure of the data to be searched.
 *
 * @example
 * // Assuming a tree structure and options are defined appropriately:
 * const tree = { /* tree structure *\/ };
 * const options = { serviceName: 'UserService', suffix: 'Service' };
 * const hasProject = HasNestServiceProject(tree, options);
 * console.log(hasProject); // Output: true or false based on the existence of the project
 */
export function HasNestServiceProject<Tree extends TreeLike>(tree: Tree, options: HasNestServiceProjectOptions) {
  const projectName = buildNestProjectName(options);
  return HasProject(tree, projectName);
}
