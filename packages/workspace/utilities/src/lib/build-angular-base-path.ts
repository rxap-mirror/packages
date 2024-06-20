import { join } from 'path';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
  GetProjectType,
} from './get-project';
import { TreeLike } from './tree';

export interface BuildAngularBasePathOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
  entrypoint?: string | null;
}

/**
 * Constructs a base path for an Angular project within a given tree structure based on specified options.
 *
 * This function dynamically builds a path string for Angular projects, taking into account various options such as
 * whether the project is a library or an application, if it's a shared module, and specific features or entry points.
 * It validates the compatibility of options and throws errors if incompatible options are provided.
 *
 * @param {Tree} tree - The tree-like structure representing the project's files and directories.
 * @param {Readonly<BuildAngularBasePathOptions>} options - An object containing options to define the base path construction:
 * - `feature`: Optional. Specifies the feature module's name if the path is for a feature module.
 * - `shared`: Optional. A boolean indicating whether the project is a shared module.
 * - `entrypoint`: Optional. Specifies the entry point file if the path is specifically for a library's entry point.
 * - `project`: The name of the project.
 * - `directory`: Optional. Additional directory path to be appended. Defaults to an empty string if not provided.
 *
 * @returns {string} The constructed base path as a string.
 *
 * @throws {Error} If `feature` option is used with `entrypoint`, or if `entrypoint` is used but the project type is not a library.
 *
 * ### Usage
 *
 * const tree = { ... };
 * const options = { project: 'my-lib', entrypoint: 'index', shared: true };
 * const basePath = BuildAngularBasePath(tree, options);
 * ```
 */
export function BuildAngularBasePath<Tree extends TreeLike>(
  tree: Tree,
  options: Readonly<BuildAngularBasePathOptions>,
): string {
  const { feature, shared, entrypoint } = options;
  let { project, directory } = options;
  directory ??= '';
  project = shared ? 'shared' : project;
  const type = GetProjectType(tree, project);
  let infix = '';
  if (type === 'library') {
    if (!directory.startsWith('lib/')) {
      infix = 'lib';
    }
  }
  if (entrypoint) {
    if (feature) {
      throw new Error('The feature option is not supported with the entrypoint option');
    }
    if (type !== 'library') {
      throw new Error('The entrypoint option is only supported for library project');
    }
    const projectRoot = GetProjectRoot(tree, project);
    return join(projectRoot, entrypoint, 'src', infix, directory);
  }
  const projectSourceRoot = GetProjectSourceRoot(tree, project);
  if (feature) {
    return join(projectSourceRoot, infix, 'feature', feature, directory);
  } else {
    return join(projectSourceRoot, infix, directory);
  }
}
