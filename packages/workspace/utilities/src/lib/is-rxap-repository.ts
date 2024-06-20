import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import * as process from 'process';
import { GetPackageJson } from './package-json-file';
import { TreeLike } from './tree';

/**
 * Determines if the specified workspace root or tree structure is a RxAP repository.
 *
 * This function checks if the repository URL in the `package.json` file matches the RxAP repository URL
 * ('https://gitlab.com/rxap/packages.git'). It supports both a file system path as a string or a `TreeLike` object
 * representing a virtual file system structure.
 *
 * @param {string | TreeLike} workspaceRootOrTree - The root directory of the workspace or a tree-like structure
 * containing the workspace files. Defaults to the current working
 * directory if not provided.
 * @returns {boolean} Returns `true` if the repository URL in the `package.json` is the RxAP repository URL,
 * otherwise returns `false`.
 * @throws {Error} Throws an error if `package.json` cannot be found in the provided directory when a string path is used.
 */
export function IsRxapRepository(workspaceRootOrTree: string | TreeLike = process.cwd()) {
  let packageJson: any;
  if (typeof workspaceRootOrTree === 'string') {
    const packageJsonFile = join(workspaceRootOrTree, 'package.json');
    if (existsSync(packageJsonFile)) {
      packageJson = JSON.parse(readFileSync(packageJsonFile).toString('utf-8'));
    } else {
      throw new Error(`No package.json found in ${ workspaceRootOrTree }`);
    }
  } else {
    packageJson = GetPackageJson(workspaceRootOrTree);
  }
  return packageJson.repository?.url === 'https://gitlab.com/rxap/packages.git';
}
