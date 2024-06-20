import { CoerceArrayItems } from '@rxap/utilities';
import { join } from 'path';
import { UpdateJsonFile } from './json-file';
import { TreeLike } from './tree';

/**
 * Modifies or initializes a `lerna.json` configuration file within a specified directory.
 * This function ensures that the Lerna configuration adheres to a standard schema and sets default values for various properties if they are not already specified.
 *
 * @param {TreeLike} tree - The file system abstraction that provides methods to read and write files.
 * @param {string} [baseDir=''] - The base directory path where the `lerna.json` file is located or will be created. Defaults to the current directory if not specified.
 *
 * The function performs the following operations on the `lerna.json` file:
 * - Sets the `$schema` property to the Lerna JSON schema URL if it is not already defined.
 * - Removes the `useWorkspaces` property if it exists, as its presence can conflict with other settings.
 * - Sets the `version` property to 'independent' to allow independent version management of packages if not specified.
 * - Sets the `npmClient` property to 'yarn' as the default client for managing node packages if not specified.
 * - Ensures the `command` object exists and initializes nested properties within it:
 * - `command.version` object is ensured and initialized with default settings for managing versions:
 * - `message` set to a default release message.
 * - `conventionalCommits` enabled to use conventional commit messages for versioning.
 * - `allowBranch` array is populated with default branch names and patterns that are allowed for releases.
 * - `ignoreChanges` array is populated with patterns of files to ignore when detecting changes for versioning.
 * - Creates the `lerna.json` file if it does not exist.
 *
 * Note: This function relies on `UpdateJsonFile` to read, modify, and write the JSON file, and `CoerceArrayItems` to ensure array properties contain specific default values.
 */
export function CoerceLernaJson(tree: TreeLike, baseDir = '') {
  UpdateJsonFile(tree, (lerna: any) => {
    lerna.$schema ??= 'https://json.schemastore.org/lerna';
    if (lerna.useWorkspaces !== undefined) {
      delete lerna.useWorkspaces;
    }
    lerna.version ??= 'independent';
    lerna.npmClient ??= 'yarn';
    lerna.command ??= {};
    lerna.command.version ??= {};
    lerna.command.version.message ??= 'chore(release): version';
    lerna.command.version.conventionalCommits ??= true;
    lerna.command.version.allowBranch ??= [];
    CoerceArrayItems(lerna.command.version.allowBranch, [
      'development',
      'latest',
      'next',
      '+(1|2|3|4|5|6|7|8|9|0).x.x',
      '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x',
      '+(1|2|3|4|5|6|7|8|9|0).x.x-dev',
      '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x-dev',
    ]);
    lerna.command.version.ignoreChanges ??= [];
    CoerceArrayItems(lerna.command.version.ignoreChanges, [
      '**/*.md',
      '**/*.spec.ts',
      '**/*.stories.ts',
      '**/*.cy.ts',
      '**/*.js',
      '**/*.handlebars',
      '**/tsconfig.json',
      '**/tsconfig.*.json',
      ".gitlab/**",
      "gitlab-ci.yml",
    ]);
  }, join(baseDir, 'lerna.json'), { create: true });

}
