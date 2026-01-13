import {
  GetLatestPackageVersion,
  GetPackagePeerDependencies,
} from '@rxap/node-utilities';
import {
  isPromise,
  SortProperties,
} from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import { gt } from 'semver';
import { IsRxapRepository } from './is-rxap-repository';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { PackageJson } from './package-json';
import {
  IsFsTreeLike,
  IsGeneratorTreeLike,
  IsJsonObject,
  IsSchematicTreeLike,
  JsonValue,
  TreeAdapter,
  TreeLike,
} from './tree';
import 'colors';

/**
 * Retrieves the `package.json` file as a JSON object from a specified directory within a tree-like structure.
 *
 * This function is a generic utility that fetches the `package.json` file, which typically contains metadata about the project such as the project name, version, and dependencies. It uses a generic type `Tree` which must conform to the `TreeLike` interface, allowing for flexibility with different tree implementations.
 *
 * @param tree - The tree-like structure from which to retrieve the `package.json` file. This structure must implement the `TreeLike` interface.
 * @param basePath - An optional base path within the tree where the `package.json` file is located. Defaults to the root of the tree if not specified.
 * @returns The `package.json` file as a JSON object of type `PackageJson`.
 *
 * @example
 * // Assuming `projectTree` is an object conforming to `TreeLike` and contains a `package.json` at the root.
 * const packageJson = GetPackageJson(projectTree);
 * process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(packageJson.name); // Outputs the name property from package.json
 *
 * @example
 * // Assuming `projectTree` contains a `package.json` in the 'app' subdirectory.
 * const packageJson = GetPackageJson(projectTree, 'app');
 * process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(packageJson.version); // Outputs the version property from package.json
 */
export function GetPackageJson<Tree extends TreeLike>(tree: Tree, basePath = ''): PackageJson {
  return GetJsonFile(tree, join(basePath, 'package.json'));
}

/**
 * Checks if a `package.json` file exists at the specified base path within the given tree structure.
 *
 * @param tree - The tree structure to search within. This should be an object that conforms to the `TreeLike` interface, which must have an `exists` method.
 * @param basePath - An optional base path where the search for `package.json` should start. Defaults to the root ('').
 * @returns `true` if a `package.json` file exists at the specified path within the tree, otherwise `false`.
 *
 * @typeparam Tree - The type of the tree structure, must extend `TreeLike`.
 *
 * @example
 * // Assuming `projectTree` is an object that implements `TreeLike`:
 * const hasPackage = HasPackageJson(projectTree, 'src/app');
 * process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(hasPackage); // Outputs: true or false based on the existence of `package.json` in 'src/app'
 */
export function HasPackageJson<Tree extends TreeLike>(tree: Tree, basePath = ''): boolean {
  return tree.exists(join(basePath, 'package.json'));
}

export interface UpdatePackageJsonOptions extends UpdateJsonFileOptions {
  basePath?: string;
}

export function UpdatePackageJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: ((packageJson: PackageJson) => void),
  options?: UpdatePackageJsonOptions,
): void
export function UpdatePackageJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: ((packageJson: PackageJson) => Promise<void>),
  options?: UpdatePackageJsonOptions,
): Promise<void>
/**
 * Updates the `package.json` file within a given project tree structure.
 *
 * This function applies modifications to the `package.json` file based on the provided updater function.
 * It can handle both synchronous and asynchronous updates. After the updates are applied, it performs a cleanup
 * operation on the `package.json` file to ensure it remains in a consistent state.
 *
 * @param {Tree} tree - The project tree that contains the `package.json` file.
 * @param {Function} updaterOrJsonFile - A function that takes the current `package.json` object as an argument.
 * This function can modify the `package.json` directly and may return a promise if asynchronous operations are needed.
 * @param {UpdatePackageJsonOptions} [options] - Optional configuration options such as the base path to the `package.json` file.
 * If not specified, the base path defaults to the root of the project tree.
 *
 * @returns {void | Promise<void>} - Returns nothing if the updater function is synchronous, or a Promise that resolves when
 * asynchronous operations are complete.
 *
 * @template Tree - A generic type that extends `TreeLike`, representing the structure of the project tree.
 *
 * @example
 * // Synchronously update a dependency version in package.json
 * UpdatePackageJson(projectTree, (packageJson) => {
 * packageJson.dependencies['example-package'] = '^2.0.0';
 * });
 *
 * @example
 * // Asynchronously add a script to package.json
 * UpdatePackageJson(projectTree, async (packageJson) => {
 * const data = await fetchData();
 * packageJson.scripts['new-script'] = data.scriptCommand;
 * }, { basePath: './apps/my-app' });
 */
export function UpdatePackageJson<Tree extends TreeLike>(
  tree: Tree,
  updaterOrJsonFile: ((packageJson: PackageJson) => void | Promise<void>),
  options?: UpdatePackageJsonOptions,
): void | Promise<void> {
  return UpdateJsonFile(tree, (packageJson) => {
    const promise = updaterOrJsonFile(packageJson);
    if (isPromise(promise)) {
      return promise.then(() => {
        CleanupPackageJsonFile(packageJson);
      });
    }
    CleanupPackageJsonFile(packageJson);
    return undefined;
  }, join(options?.basePath ?? '', 'package.json'), options);
}

/**
 * Adds a new script or updates an existing script in the `package.json` file of a project.
 *
 * This function leverages the `UpdatePackageJson` function to modify the `scripts` section of the `package.json`.
 * If the `scripts` object does not exist, it will be initialized. The specified script will then be added or updated
 * with the provided script content.
 *
 * @param tree - The tree-like structure representing the file system or project structure.
 * @param scriptName - The name of the script to add or update in the `package.json`.
 * @param script - The command string that the script will execute.
 * @param options - Optional. Configuration options for updating the `package.json` file.
 * @returns The result of the `UpdatePackageJson` function, typically a boolean indicating success or failure.
 *
 * @template Tree - A generic type that extends `TreeLike`, representing the structure to be manipulated.
 */
export function AddPackageJsonScript<Tree extends TreeLike>(
  tree: Tree,
  scriptName: string,
  script: string,
  options?: UpdatePackageJsonOptions,
) {
  return UpdatePackageJson(
    tree,
    packageJson => {
      packageJson.scripts ??= {};
      packageJson.scripts[scriptName] = script;
    },
    options,
  );
}

export interface AddPackageJsonDependencyOptions extends UpdatePackageJsonOptions {
  /**
   * true - only update the version if the current version is lower than the new version and the anticipated version is not set to latest
   */
  soft?: boolean;
  /**
   * true (default) - also install the package peer dependencies
   */
  withPeerDependencies?: boolean;
  /**
   * true (default) - do not install the package peer dependencies if they are not rxap packages
   */
  withoutNonRxapPeerDependencies?: boolean;
}

/**
 * Asynchronously adds a specified package and its version to the `package.json` of a project tree, with options to handle peer dependencies and specific dependency types.
 *
 * @param tree - The project tree structure which contains the `package.json` file.
 * @param packageName - The name of the package to be added.
 * @param packageVersion - The version of the package to be added. Defaults to 'latest', which will fetch the latest version available.
 * @param options - Configuration options for adding the package. Includes flags for including peer dependencies and excluding non-Rxap peer dependencies.
 * @param propertyPath - The type of dependency under which the package should be added. Can be one of 'dependencies', 'devDependencies', 'peerDependencies', or 'optionalDependencies'. Defaults to 'dependencies'.
 *
 * The function performs several key operations:
 * - Resolves the actual version of the package if 'latest' is specified.
 * - Ensures that the package is not already present in the specified dependency category in `package.json`.
 * - Promotes the package to the specified dependency category if it exists under a different category.
 * - Cleans up any duplicate entries across different dependency categories.
 * - Optionally handles the addition of peer dependencies if specified in the options.
 * - Logs detailed information about the operations being performed, including any errors or important actions.
 *
 * Note: The function uses console logs to provide feedback and error handling. It also relies on external functions like `GetLatestPackageVersion`, `UpdatePackageJson`, and `GetPackagePeerDependencies` which are assumed to be implemented elsewhere in the application.
 *
 * @throws {Error} Throws an error if the package ends up in multiple dependency categories after cleanup.
 */
export async function AddPackageJsonDependency<Tree extends TreeLike>(
  tree: Tree,
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options: AddPackageJsonDependencyOptions = {},
  propertyPath: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies' = 'dependencies',
) {

  const { withPeerDependencies = true, withoutNonRxapPeerDependencies = true } = options;

  let mewPackageVersion: string | null = packageVersion;
  if (packageVersion === 'latest') {
    mewPackageVersion = await GetLatestPackageVersion(packageName);
  }

  if (!mewPackageVersion) {
    console.error(`Could not resolve the latest version of the package \x1b[31m${ packageName }\x1b[0m`);
    return;
  }

  mewPackageVersion = mewPackageVersion.replace(/^(~|\^|>|<|<=|>=)/, '');

  let addedNewPackage = false;

  function promotePackage(packageJson: PackageJson) {
    const isDependency = packageJson.dependencies?.[packageName] !== undefined;
    const isDevDependency = packageJson.devDependencies?.[packageName] !== undefined;
    const isPeerDependency = packageJson.peerDependencies?.[packageName] !== undefined;
    const isOptionalDependency = packageJson.optionalDependencies?.[packageName] !== undefined;
    if (![isDevDependency, isDependency, isPeerDependency, isOptionalDependency].some(Boolean)) {
      // the package is not in the dependencies and needs not to be promoted
      return;
    }
    if (propertyPath === 'dependencies' && isDependency) {
      // the package is already in the dependencies
      return;
    }
    if (propertyPath === 'devDependencies' && isDevDependency) {
      // the package is already in the devDependencies
      return;
    }
    if (propertyPath === 'peerDependencies' && isPeerDependency) {
      // the package is already in the peerDependencies
      return;
    }
    if (propertyPath === 'optionalDependencies' && isOptionalDependency) {
      // the package is already in the optionalDependencies
      return;
    }
    process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Promote the package \x1b[34m${ packageName }\x1b[0m from \x1b[90m${ isDependency ? 'dependencies' : isDevDependency ? 'devDependencies' : isPeerDependency ? 'peerDependencies' : 'optionalDependencies' }\x1b[0m to \x1b[90m${ propertyPath }\x1b[0m`.yellow);
    const version = (packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName] ?? packageJson.peerDependencies?.[packageName] ?? packageJson.optionalDependencies?.[packageName])!;
    switch (propertyPath) {

      case 'dependencies':
        if (isDevDependency) {
          delete packageJson.devDependencies![packageName];
        }
        if (isPeerDependency) {
          delete packageJson.peerDependencies![packageName];
        }
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
        packageJson.dependencies ??= {};
        packageJson.dependencies[packageName] = version;
        break;

      case 'devDependencies':
        if (isDependency) {
          // if the package is in the dependencies then it should not be promoted to the devDependencies
          break;
        }
        if (isPeerDependency) {
          delete packageJson.peerDependencies![packageName];
        }
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
        packageJson.devDependencies ??= {};
        packageJson.devDependencies[packageName] = version;
        break;

      case 'peerDependencies':
        if (isDependency || isDevDependency) {
          // if the package is in the dependencies or dev dependency then it should not be promoted to the peerDependencies
          break;
        }
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
        packageJson.peerDependencies ??= {};
        packageJson.peerDependencies[packageName] = version;
        break;
    }
  }

  function cleanup(packageJson: PackageJson) {
    const isDependency = packageJson.dependencies?.[packageName] !== undefined;
    const isDevDependency = packageJson.devDependencies?.[packageName] !== undefined;
    const isPeerDependency = packageJson.peerDependencies?.[packageName] !== undefined;
    const isOptionalDependency = packageJson.optionalDependencies?.[packageName] !== undefined;
    if ([isDevDependency, isDependency, isPeerDependency, isOptionalDependency].filter(Boolean).length > 1) {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The package \x1b[34m${ packageName }\x1b[0m is in multiple dependencies`.yellow);
      if (isDependency) {
        if (isDevDependency) {
          delete packageJson.devDependencies![packageName];
        }
        if (isPeerDependency) {
          delete packageJson.peerDependencies![packageName];
        }
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
      } else if (isDevDependency) {
        if (isPeerDependency) {
          delete packageJson.peerDependencies![packageName];
        }
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
      } else if (isPeerDependency) {
        if (isOptionalDependency) {
          delete packageJson.optionalDependencies![packageName];
        }
      }
      if ([isDevDependency, isDependency, isPeerDependency, isOptionalDependency].filter(Boolean).length > 1) {
        throw new Error(`FATIAL: The package \x1b[34m${ packageName }\x1b[0m is in multiple dependencies: ` + JSON.stringify({ isDependency, isDevDependency, isPeerDependency, isOptionalDependency }));
      }
    }
  }

  await UpdatePackageJson(
    tree,
    packageJson => {
      cleanup(packageJson);
      promotePackage(packageJson);
      const currentVersion = packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName] ?? packageJson.peerDependencies?.[packageName] ?? packageJson.optionalDependencies?.[packageName] ?? null;
      const isDependency = packageJson.dependencies?.[packageName] !== undefined;
      const isDevDependency = packageJson.devDependencies?.[packageName] !== undefined;
      const isPeerDependency = packageJson.peerDependencies?.[packageName] !== undefined;
      const isOptionalDependency = packageJson.optionalDependencies?.[packageName] !== undefined;
      let depObject: Record<string, string>;
      if (isDependency) {
        depObject = packageJson.dependencies!;
        propertyPath = 'dependencies';
      } else if (isDevDependency) {
        depObject = packageJson.devDependencies!;
        propertyPath = 'devDependencies';
      } else if (isPeerDependency) {
        depObject = packageJson.peerDependencies!;
        propertyPath = 'peerDependencies';
      } else if (isOptionalDependency) {
        depObject = packageJson.optionalDependencies!;
        propertyPath = 'optionalDependencies';
      } else {
        packageJson[propertyPath] ??= {};
        depObject = packageJson[propertyPath]!;
      }
      if (options?.soft) {
        if (currentVersion) {
          if (packageVersion === 'latest') {
            process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The package \x1b[34m${ packageName }\x1b[0m already exists in the \x1b[90m${ propertyPath }\x1b[0m`.grey);
            // if soft and latest and the package already exists in the dependencies do nothing
            return;
          }
          const cleanCurrentVersion = currentVersion.replace(/^(~|\^|>|<|<=|>=)/, '');
          if (cleanCurrentVersion === mewPackageVersion) {
            process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[32m${ currentVersion }\x1b[0m is equal to the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`.grey);
            return;
          }
          if (gt(cleanCurrentVersion, mewPackageVersion!)) {
            process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[31m${ currentVersion }\x1b[0m is greater than the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`.grey);
            // if soft and the current version is greater than the new version do nothing
            return;
          }
        }
      }
      if (currentVersion) {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Change the package \x1b[34m${ packageName }\x1b[0m version from \x1b[31m${ currentVersion }\x1b[0m to \x1b[32m${ mewPackageVersion }\x1b[0m`);
      } else {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Add the package \x1b[34m${ packageName }\x1b[0m to the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ mewPackageVersion }\x1b[0m`.green);
        addedNewPackage = true;
      }
      if (packageName.match(/^@rxap\//) && IsRxapRepository(tree)) {
        process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Detecting that the workspace is the \x1b[34mrxap\x1b[33m workspace. The package \x1b[34m${ packageName }\x1b[33m will \x1b[31mNOT\x1b[33m be added to the package.json file.`.grey);
      } else {
        depObject[packageName] = mewPackageVersion!;
      }
    },
    options,
  );

  if (addedNewPackage && withPeerDependencies) {
    const peerDependencies = await GetPackagePeerDependencies(packageName, mewPackageVersion!);
    if (Object.keys(peerDependencies).length === 0) {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The package \x1b[34m${ packageName }\x1b[0m has no peer dependencies`.grey);
    } else {
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.group(`The package \x1b[34m${ packageName }\x1b[0m has the following peer dependencies: ${Object.keys(peerDependencies).join(', ')}`);
      for (const [ peerDependency, peerDependencyVersion ] of Object.entries(peerDependencies)) {
        if (peerDependency === 'tslib') {
          process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Skip peer dependency \x1b[34m${ peerDependency }\x1b[0m as it is a typescript library`.grey);
          continue;
        }
        if (withoutNonRxapPeerDependencies) {
          if (!peerDependency.startsWith('@rxap/')) {
            process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Skip peer dependency \x1b[34m${ peerDependency }\x1b[0m as it is not a rxap package`.grey);
            continue;
          }
        }
        if (peerDependencyVersion.match(/^(~|\^|>|<|<=|>=)?\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$/)) {
          process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`Add peer dependency \x1b[34m${ peerDependency }\x1b[0mto the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ peerDependencyVersion }\x1b[0m`.cyan);
          await AddPackageJsonDependency(tree, peerDependency, peerDependencyVersion, options, propertyPath);
        } else {
          process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.log(`The peer dependency \x1b[34m${ peerDependency }\x1b[0m has an unsupported version \x1b[31m${ peerDependencyVersion }\x1b[0m`.yellow);
        }
      }
      process.env['RXAP_GENERATOR_DEBUG'] === 'true' && console.groupEnd();
    }
  }

}

/**
 * Adds a development dependency to the `package.json` file within a given project tree.
 *
 * This function is a wrapper around `AddPackageJsonDependency`, specifically setting the dependency type to 'devDependencies'.
 * It is designed to be used in scenarios where development-specific packages are needed, such as testing frameworks or build tools.
 *
 * @param tree - The project tree structure where the `package.json` file is located.
 * @param packageName - The name of the package to be added as a development dependency.
 * @param packageVersion - The version of the package to be added. Defaults to 'latest' if not specified.
 * @param options - Optional configuration settings for adding the dependency, such as custom registry configuration.
 *
 * @returns A promise that resolves when the dependency has been successfully added to the `package.json` file.
 *
 * @template Tree - The type of the tree structure that conforms to `TreeLike`, representing the project's file and folder structure.
 */
export async function AddPackageJsonDevDependency<Tree extends TreeLike>(
  tree: Tree,
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
) {
  return AddPackageJsonDependency(tree, packageName, packageVersion, options, 'devDependencies');
}

/**
 * Cleanup the packageJson object in place
 * @param content
 */
export function CleanupPackageJsonFile<T extends PackageJson = PackageJson>(content: PackageJson): T {

  content.dependencies ??= {};
  content.devDependencies ??= {};
  content.peerDependencies ??= {};
  content.optionalDependencies ??= {};
  content['nx-migrations'] ??= {};
  content['nx-migrations'].packageGroup ??= [];
  content.keywords ??= [];

  content.dependencies = SortProperties(content.dependencies);
  content.devDependencies = SortProperties(content.devDependencies);
  content.peerDependencies = SortProperties(content.peerDependencies);
  content.optionalDependencies = SortProperties(content.optionalDependencies);
  content['nx-migrations'].packageGroup.sort((a, b) => a.package.localeCompare(b.package));
  content.keywords.sort();

  if (Object.keys(content.dependencies).length === 0) {
    delete content.dependencies;
  }
  if (Object.keys(content.devDependencies).length === 0) {
    delete content.devDependencies;
  }
  if (Object.keys(content.peerDependencies).length === 0) {
    delete content.peerDependencies;
  }
  if (Object.keys(content.optionalDependencies).length === 0) {
    delete content.optionalDependencies;
  }
  if (content['nx-migrations'].packageGroup.length === 0) {
    delete content['nx-migrations'].packageGroup;
  }
  if (Object.keys(content['nx-migrations']).length === 0) {
    delete content['nx-migrations'];
  }
  if (Object.keys(content.keywords).length === 0) {
    delete content.keywords;
  }

  SortProperties<T>(content as T, (a, b) => {
    if (a === 'version') {
      return -1;
    }
    if (b === 'version') {
      return 1;
    }
    if (a === 'name') {
      return -1;
    }
    if (b === 'name') {
      return 1;
    }
    if (a === 'description') {
      return -1;
    }
    if (b === 'description') {
      return 1;
    }
    if (a === 'license') {
      return -1;
    }
    if (b === 'license') {
      return 1;
    }
    if (a === 'scripts') {
      return -1;
    }
    if (b === 'scripts') {
      return 1;
    }
    if (a === 'dependencies') {
      return -1;
    }
    if (b === 'dependencies') {
      return 1;
    }
    if (a === 'peerDependencies') {
      return -1;
    }
    if (b === 'peerDependencies') {
      return 1;
    }
    return a.localeCompare(b);
  });

  return content as T;

}

/**
 * Retrieves the `package.json` file from the root of a project, either from a virtual file system represented by a `TreeLike` interface or from the actual file system.
 *
 * @param {TreeLike} [tree] - An optional parameter representing a tree structure. This can be either a schematic or generator tree.
 * @returns {PackageJson} The parsed contents of the `package.json` file as a JSON object.
 *
 * @throws {Error} Throws an error if the tree provided is neither a schematic nor a generator tree, if the `package.json` file does not exist at the expected location, or if the file is not a valid JSON object.
 *
 * ## Description
 * This function is designed to work with different types of project structures:
 * - **Schematic Tree**: If a `TreeLike` object that conforms to a schematic tree is provided, the function uses the tree's root path to locate the `package.json`.
 * - **Generator Tree**: For generator trees, the function uses the root path `/` to access files at the root of the virtual file system.
 * - **No Tree Provided**: If no tree is provided, the function defaults to using the current working directory of the process to find the `package.json`.
 *
 * The function first determines the correct root directory based on the input tree. It then constructs the path to the `package.json` file and checks for its existence. If the file exists, it reads and parses the JSON content. Finally, it validates that the parsed JSON is an object before returning it.
 *
 * This function is essential for tools and libraries that need to interact with a project's metadata stored in the `package.json` file, especially in environments where file structures are abstracted, such as during schematic or generator executions.
 */
export function GetRootPackageJson(tree?: TreeLike): PackageJson {
  let rootPackageJson: JsonValue;
  let root: string;

  if (tree) {
    if (IsSchematicTreeLike(tree)) {
      root = tree.root.path;
    } else if (IsGeneratorTreeLike(tree)) {
      // Don't use the tree.root as this points to the root in the "real" file system, but to access the files
      // at the root of the FsTree the root path "/" must be used
      root = '/';
    } else if(IsFsTreeLike(tree)) {
      root = tree.root;
    } else {
      throw new Error('The tree is not a valid schematic or generator tree');
    }
  } else {
    root = process.cwd();
  }
  const rootPackageJsonFile = join(root, 'package.json');
  if (tree) {
    const wrappedTree = new TreeAdapter(tree);
    if (!tree.exists(rootPackageJsonFile)) {
      throw new Error(`Could not find the root package.json file in filePath '${ rootPackageJsonFile }'`);
    }
    rootPackageJson = wrappedTree.readJson(rootPackageJsonFile);
  } else {
    if (!existsSync(rootPackageJsonFile)) {
      throw new Error(`Could not find the root package.json file in '${ root }'`);
    }
    rootPackageJson = JSON.parse(readFileSync(rootPackageJsonFile, 'utf-8'));
  }

  if (!IsJsonObject(rootPackageJson)) {
    throw new Error('The root package.json file is not a valid JSON object');
  }
  return rootPackageJson as PackageJson;
}
