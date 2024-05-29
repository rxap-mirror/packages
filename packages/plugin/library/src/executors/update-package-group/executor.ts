import { ExecutorContext } from '@nx/devkit';
import {
  GetAllPackageDependenciesForProject,
  GetAllPackageDependenciesForProjectWihRetry,
  LoadProjectToPackageMapping,
  LoadProjectToPackageMappingWithRetry,
  readPackageJsonForProject,
  readPackageJsonForProjectWithRetry,
  writePackageJsonFormProject,
} from '@rxap/plugin-utilities';
import { readFileSync } from 'fs';
import {
  ArrayPackageGroup,
  normalizePackageGroup,
  PackageGroup,
} from 'nx/src/utils/package-json';
import { join } from 'path';
import { UpdatePackageGroupExecutorSchema } from './schema';

function normalizePackageVersion(version: string): string {
  return version.replace(/[\^~>=<]/g, '');
}

function convertToPackageGroup(input: Record<string, string>, packageGroupRegex: RegExp[]): ArrayPackageGroup {
  return Object.entries(input)
    .filter(([ packageName ]) => packageGroupRegex.some(regex => regex.test(packageName)))
    .map(([ packageName, version ]) => ({
      package: packageName,
      version: normalizePackageVersion(version),
    }));
}

async function getPackageGroupFromDependencies(context: ExecutorContext, packageGroupRegex: RegExp[]): Promise<ArrayPackageGroup> {
  const directPackageDependencies = await GetAllPackageDependenciesForProjectWihRetry(context);
  return convertToPackageGroup(directPackageDependencies, packageGroupRegex);
}

async function getPackageGroupFromPeerDependencies(context: ExecutorContext, packageGroupRegex: RegExp[]): Promise<ArrayPackageGroup> {
  const peerDependencies = (await readPackageJsonForProjectWithRetry(context)).peerDependencies ?? {};
  return convertToPackageGroup(peerDependencies, packageGroupRegex);
}

function getPackageGroupFromRootDependencies(context: ExecutorContext, include: string[]): ArrayPackageGroup {
  if (include.length === 0) {
    console.log('No packages to include from the root package.json');
    return [];
  }
  console.log('Include the following packages:', include.join(', '), 'from the root package.json');
  const {
    dependencies = {},
    devDependencies = {},
  } = JSON.parse(readFileSync(join(context.root, 'package.json'), 'utf-8'));
  const includeDependencies = Object.entries(dependencies).filter(
    ([ packageName ]) => include.includes(packageName)).reduce((acc, [ packageName, version ]) => (
    {
      ...acc,
      [packageName]: version,
    }
  ), {});
  const includePeerDependencies = Object.entries(devDependencies).filter(
    ([ packageName ]) => include.includes(packageName)).reduce((acc, [ packageName, version ]) => (
    {
      ...acc,
      [packageName]: version,
    }
  ), {});
  const includes = { ...includeDependencies, ...includePeerDependencies };
  return convertToPackageGroup(includes, [ /.*/ ]);
}

async function getPackageGroup(context: ExecutorContext, packageGroupRegex: RegExp[], include: string[] = []): Promise<ArrayPackageGroup> {
  return mergePackageGroup(mergePackageGroup(await getPackageGroupFromPeerDependencies(context, packageGroupRegex),
    await getPackageGroupFromDependencies(context, packageGroupRegex),
  ), getPackageGroupFromRootDependencies(context, include));
}

function mergePackageGroup(original: PackageGroup, updated: ArrayPackageGroup): ArrayPackageGroup {
  const normalized = normalizePackageGroup(original);
  return [ ...updated, ...normalized ].filter((item, index, array) => {
    return array.findIndex(({ package: packageName }) => packageName === item.package) === index;
  });
}

export default async function runExecutor(
  options: UpdatePackageGroupExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for update-package-group', options);


  const packageJson = await readPackageJsonForProjectWithRetry(context);

  // ensure the property "ng-migrations" exists
  packageJson['nx-migrations'] ??= {};

  const { 'nx-migrations': nxMigrations } = packageJson;

  if (!nxMigrations) {
    console.error('INTERNAL: Could not extract the nx-migrations property from the package.json');
    return { success: false };
  }

  if (typeof nxMigrations !== 'object') {
    console.error('INTERNAL: The nx-migrations property in the package.json is not an object');
    return { success: false };
  }

  const packageGroupRegex = options.packageGroupRegex.map(regex => new RegExp(regex));

  console.log(`Update package group for project ${ context.projectName } with the following package group regex:`, packageGroupRegex.map(regex => regex.toString()));

  await LoadProjectToPackageMappingWithRetry(context);

  let packageGroup = await getPackageGroup(context, packageGroupRegex, options.include);
  nxMigrations.packageGroup ??= [];

  if (options.merge) {
    console.log('Merge the package group');
    packageGroup = mergePackageGroup(nxMigrations.packageGroup, packageGroup);
  }

  console.log('set the package group', JSON.stringify(packageGroup, undefined, 2));
  nxMigrations.packageGroup = packageGroup.sort((a, b) => a.package.localeCompare(b.package));

  writePackageJsonFormProject(context, packageJson);

  return {
    success: true,
  };
}
