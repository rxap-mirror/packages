import { join } from 'path';
import { GetProject, GetProjectSourceRoot } from './get-project';
import { IsLibraryProject } from './is-project';
import { buildNestProjectName } from './project-utilities';
import { TreeLike } from './tree';

export interface BuildNestBasePathOptions {
  project: string;
  feature?: string | null;
  directory?: string | null;
  shared?: boolean;
  backend: { project?: string | null, kind?: any } | undefined;
}

/**
 * Constructs a full path for a base directory within a NestJS project structure.
 *
 * This function generates a complete path by combining the project's source root with a specified directory.
 * It is particularly useful in scenarios where a specific directory path within a NestJS project needs to be resolved
 * programmatically during project scaffolding or configuration.
 *
 * @param {Tree} tree - An abstraction representing the file system structure (typically provided by a library or framework).
 * @param {BuildNestBasePathOptions} options - Configuration options for building the path. Includes:
 * - `directory`: A subdirectory path to append to the project's source root. Defaults to an empty string if not provided.
 * @returns {string} The full path combining the project's source root with the specified directory.
 *
 * @template Tree - A generic type extending `TreeLike` which must provide methods for interacting with the file system.
 *
 * @example
 * // Assuming `tree` is an instance of a class implementing `TreeLike` and `options` is properly configured:
 * const basePath = BuildNestBasePath(tree, { directory: 'src/app' });
 * console.log(basePath); // Outputs the full path to the 'src/app' directory within the NestJS project.
 */
export function BuildNestBasePath<Tree extends TreeLike>(tree: Tree, options: BuildNestBasePathOptions): string {
  let { directory } = options;
  directory ??= '';
  // get the project source root after the coerce call.
  // else it is possible that GetProjectSourceRoot fails, bc the project does not yet exist.
  const projectName = buildNestProjectName(options);
  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);
  if (IsLibraryProject(GetProject(tree, projectName))) {
    if (!directory.startsWith('lib/') && directory !== 'lib' && !directory.startsWith('/lib/') && directory !== '/lib') {
      directory = join('lib', directory);
    }
  }
  return join(projectSourceRoot, directory);
}
