import {
  GetLatestPackageVersion,
  GetPackagePeerDependencies,
} from '@rxap/node-utilities';
import { SortProperties } from '@rxap/utilities';
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
  updaterOrJsonFile: ((packageJson: PackageJson) => void | PromiseLike<void>),
  options?: UpdatePackageJsonOptions,
) {
  return UpdateJsonFile(tree, async (packageJson) => {
    await updaterOrJsonFile(packageJson);
    CleanupPackageJsonFile(packageJson);
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
}

export async function AddPackageJsonDependency<Tree extends TreeLike>(
  tree: Tree,
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options: AddPackageJsonDependencyOptions = {},
  propertyPath: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies' = 'dependencies',
) {

  const { withPeerDependencies = true } = options;

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

  await UpdatePackageJson(
    tree,
    packageJson => {
      const dep = packageJson[propertyPath] ??= {};
      if (options?.soft) {
        if (dep[packageName]) {
          if (packageVersion === 'latest') {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m already exists in the \x1b[90m${ propertyPath }\x1b[0m`);
            // if soft and latest and the package already exists in the dependencies do nothing
            return;
          }
          const currentVersion = dep[packageName].replace(/^(~|\^|>|<|<=|>=)/, '');
          if (currentVersion === mewPackageVersion) {
            return;
          }
          if (gt(currentVersion, mewPackageVersion!)) {
            console.log(`The package \x1b[34m${ packageName }\x1b[0m version \x1b[31m${ currentVersion }\x1b[0m is greater than the anticipated version \x1b[32m${ mewPackageVersion }\x1b[0m`);
            // if soft and the current version is greater than the new version do nothing
            return;
          }
        }
      }
      if (dep[packageName]) {
        console.log(`Change the package \x1b[34m${ packageName }\x1b[0m version from \x1b[31m${ dep[packageName] }\x1b[0m to \x1b[32m${ mewPackageVersion }\x1b[0m`);
      } else {
        console.log(`Add the package \x1b[34m${ packageName }\x1b[0m to the \x1b[90m${ propertyPath }\x1b[0m with version \x1b[32m${ mewPackageVersion }\x1b[0m`);
        addedNewPackage = true;
      }
      if (packageName.match(/^@rxap\//) && IsRxapRepository(tree)) {
        console.log(`\x1b[33mWARNING: Detecting that the workspace is the \x1b[34mrxap\x1b[33m workspace. The package \x1b[34m${ packageName }\x1b[33m will \x1b[31mNOT\x1b[33m be added to the package.json file.\x1b[0m`);
      } else {
        dep[packageName] = mewPackageVersion!;
      }
    },
    options,
  );

  if (addedNewPackage && withPeerDependencies) {
    const peerDependencies = await GetPackagePeerDependencies(packageName, mewPackageVersion!);
    if (Object.keys(peerDependencies).length === 0) {
      console.log(`The package \x1b[34m${ packageName }\x1b[0m has no peer dependencies`);
    } else {
      console.log(
        `The package \x1b[34m${ packageName }\x1b[0m has the following peer dependencies:`,
        Object.keys(peerDependencies).join(', ')
      );
      for (const [ peerDependency, peerDependencyVersion ] of Object.entries(peerDependencies)) {
        if (peerDependencyVersion.match(/^(~|\^|>|<|<=|>=)?\d+\.\d+\.\d+(-[a-zA-Z]+)?$/)) {
          await AddPackageJsonDependency(tree, peerDependency, peerDependencyVersion, options, propertyPath);
        } else {
          console.log(`The peer dependency \x1b[34m${ peerDependency }\x1b[0m has an unsupported version \x1b[31m${ peerDependencyVersion }\x1b[0m`);
        }
      }
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
