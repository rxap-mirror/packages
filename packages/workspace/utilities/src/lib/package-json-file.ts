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
import gt from 'semver/functions/gt';
import { IsRxapRepository } from './is-rxap-repository';
import {
  GetJsonFile,
  UpdateJsonFile,
  UpdateJsonFileOptions,
} from './json-file';
import { PackageJson } from './package-json';
import {
  IsGeneratorTreeLike,
  IsJsonObject,
  IsSchematicTreeLike,
  JsonValue,
  TreeAdapter,
  TreeLike,
} from './tree';
import 'colors';

export function GetPackageJson<Tree extends TreeLike>(tree: Tree, basePath = ''): PackageJson {
  return GetJsonFile(tree, join(basePath, 'package.json'));
}

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
    console.log(`Promote the package \x1b[34m${ packageName }\x1b[0m from \x1b[90m${ isDependency ? 'dependencies' : isDevDependency ? 'devDependencies' : isPeerDependency ? 'peerDependencies' : 'optionalDependencies' }\x1b[0m to \x1b[90m${ propertyPath }\x1b[0m`.yellow);
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
      console.log(`The package \x1b[34m${ packageName }\x1b[0m is in multiple dependencies`.yellow);
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
            console.log(`The package \x1b[34m${ packageName }\x1b[0m already exists in the \x1b[90m${ propertyPath }\x1b[0m`.grey);
            // if soft and latest and the package already exists in the dependencies do nothing
            return;
          }
          const cleanCurrentVersion = currentVersion.replace(/^(~|\^|>|<|<=|>=)/, '');
          if (cleanCurrentVersion === mewPackageVersion) {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[32m${ currentVersion }\x1b[0m is equal to the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`.grey);
            return;
          }
          if (gt(cleanCurrentVersion, mewPackageVersion!)) {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[31m${ currentVersion }\x1b[0m is greater than the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`.grey);
            // if soft and the current version is greater than the new version do nothing
            return;
          }
        }
      }
      if (currentVersion) {
        console.log(`Change the package \x1b[34m${ packageName }\x1b[0m version from \x1b[31m${ currentVersion }\x1b[0m to \x1b[32m${ mewPackageVersion }\x1b[0m`);
      } else {
        console.log(`Add the package \x1b[34m${ packageName }\x1b[0m to the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ mewPackageVersion }\x1b[0m`.green);
        addedNewPackage = true;
      }
      if (packageName.match(/^@rxap\//) && IsRxapRepository(tree)) {
        console.log(`Detecting that the workspace is the \x1b[34mrxap\x1b[33m workspace. The package \x1b[34m${ packageName }\x1b[33m will \x1b[31mNOT\x1b[33m be added to the package.json file.`.grey);
      } else {
        depObject[packageName] = mewPackageVersion!;
      }
    },
    options,
  );

  if (addedNewPackage && withPeerDependencies) {
    const peerDependencies = await GetPackagePeerDependencies(packageName, mewPackageVersion!);
    if (Object.keys(peerDependencies).length === 0) {
      console.log(`The package \x1b[34m${ packageName }\x1b[0m has no peer dependencies`.grey);
    } else {
      console.group(`The package \x1b[34m${ packageName }\x1b[0m has the following peer dependencies: ${Object.keys(peerDependencies).join(', ')}`);
      for (const [ peerDependency, peerDependencyVersion ] of Object.entries(peerDependencies)) {
        if (peerDependency === 'tslib') {
          console.log(`Skip peer dependency \x1b[34m${ peerDependency }\x1b[0m as it is a typescript library`.grey);
          continue;
        }
        if (withoutNonRxapPeerDependencies) {
          if (!peerDependency.startsWith('@rxap/')) {
            console.log(`Skip peer dependency \x1b[34m${ peerDependency }\x1b[0m as it is not a rxap package`.grey);
            continue;
          }
        }
        if (peerDependencyVersion.match(/^(~|\^|>|<|<=|>=)?\d+\.\d+\.\d+(-[a-zA-Z]+)?$/)) {
          console.log(`Add peer dependency \x1b[34m${ peerDependency }\x1b[0mto the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ peerDependencyVersion }\x1b[0m`.cyan);
          await AddPackageJsonDependency(tree, peerDependency, peerDependencyVersion, options, propertyPath);
        } else {
          console.log(`The peer dependency \x1b[34m${ peerDependency }\x1b[0m has an unsupported version \x1b[31m${ peerDependencyVersion }\x1b[0m`.yellow);
        }
      }
      console.groupEnd();
    }
  }

}

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
