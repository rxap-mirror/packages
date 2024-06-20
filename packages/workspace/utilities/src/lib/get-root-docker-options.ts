import {
  TreeAdapter,
  TreeLike,
} from './tree';

export interface RootDockerOptions {
  imageName?: string;
  imageRegistry?: string;
}

/**
 * Retrieves Docker configuration options from a project's configuration files.
 *
 * This function extracts Docker-related options from the `nx.json` file within a project, falling back to default values defined in `package.json` if specific Docker options are not set. It utilizes a `TreeAdapter` to interface with the project's file structure.
 *
 * @param {TreeLike} tree - The project's file structure representation, used to access configuration files.
 * @returns {RootDockerOptions} An object containing Docker options such as the image name. If no Docker-specific options are set in `nx.json`, it defaults to using the project name from `package.json` as the image name.
 *
 * @example
 * // Assuming `nx.json` contains:
 * // {
 * //   "targetDefaults": {
 * //     "docker": {
 * //       "options": {
 * //         "imageName": "custom-image-name"
 * //       }
 * //     }
 * //   }
 * // }
 * // and `package.json` contains:
 * // {
 * //   "name": "default-project-name"
 * // }
 * // Calling GetRootDockerOptions(tree) will return:
 * // { "imageName": "custom-image-name" }
 *
 * @example
 * // If `nx.json` does not specify Docker options:
 * // Calling GetRootDockerOptions(tree) will return:
 * // { "imageName": "default-project-name" }
 */
export function GetRootDockerOptions(tree: TreeLike): RootDockerOptions {
  const adapter = new TreeAdapter(tree);
  const nxJson = JSON.parse(adapter.read('nx.json', 'utf-8')!);
  const packageJson = JSON.parse(adapter.read('package.json', 'utf-8')!);
  const options: RootDockerOptions = nxJson.targetDefaults?.['docker']?.options ?? {};
  options.imageName ??= packageJson.name;
  return options;
}
