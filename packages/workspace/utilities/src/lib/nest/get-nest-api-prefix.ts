import { join } from 'path';
import {
  TreeAdapter,
  TreeLike,
} from '../tree';

export interface GetNestApiPrefixOptions {
  apiPrefix?: string | false;
  projects?: string[];
}

/**
 * Retrieves the API prefix for a NestJS project based on various configuration sources.
 *
 * This function examines the provided project's configuration files to determine the appropriate API prefix.
 * It supports explicit definition through options, or dynamically reads from the project's configuration files.
 *
 * @param {TreeLike} tree - An abstraction representing the file system structure.
 * @param {GetNestApiPrefixOptions} options - Configuration options that may explicitly specify the API prefix or indicate how to derive it.
 * @param {string} projectSourceRoot - The root directory of the project's source files.
 * @param {string} projectName - The name of the project, used as a fallback to generate the API prefix.
 * @returns {string} The determined API prefix. Returns an empty string if the API prefix is explicitly set to false in the options.
 *
 * The function first checks if `apiPrefix` is explicitly set to false in the options, returning an empty string if so.
 * If `apiPrefix` is provided and only one project is specified in the options, it returns the `apiPrefix` directly.
 * Otherwise, it attempts to read the API prefix from `app.config.ts` or `app.module.ts` within the project's `app` directory.
 * If no prefix is found in the configuration files, it constructs a default prefix using the project name, prefixed with 'api' and stripping 'service-' from the start of the project name if present.
 */
export function GetNestApiPrefix(
  tree: TreeLike,
  options: GetNestApiPrefixOptions,
  projectSourceRoot: string,
  projectName: string,
) {
  if (options.apiPrefix === false) {
    return '';
  }
  if (options.apiPrefix && options.projects?.length === 1) {
    return options.apiPrefix;
  }
  const treeAdapter = new TreeAdapter(tree);
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = treeAdapter.read(join(projectSourceRoot, 'app', 'app.config.ts'), 'utf-8')!
      .match(/validationSchema\['GLOBAL_API_PREFIX'\] = Joi.string\(\).default\('(.+)'\);/);
    if (match) {
      return match[1];
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = treeAdapter.read(join(projectSourceRoot, 'app', 'app.module.ts'), 'utf-8')!
      .match(/GLOBAL_API_PREFIX: Joi.string\(\).default\('(.+)'\)/);
    if (match) {
      return match[1];
    }
  }
  return join('api', projectName.replace(/^service-/, ''));
}
