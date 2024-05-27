import { ExecutorContext } from '@nx/devkit';
import {
  GetAllPackageDependenciesForProject,
  LoadProjectToPackageMapping,
  readPackageJsonForProject,
  writePackageJsonFormProject,
} from '@rxap/plugin-utilities';
import {
  ArrayPackageGroup,
  normalizePackageGroup,
  PackageGroup,
} from 'nx/src/utils/package-json';
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

function getPackageGroupFromDependencies(context: ExecutorContext, packageGroupRegex: RegExp[]): ArrayPackageGroup {
  const directPackageDependencies = GetAllPackageDependenciesForProject(context);
  return convertToPackageGroup(directPackageDependencies, packageGroupRegex);
}

function getPackageGroupFromPeerDependencies(context: ExecutorContext, packageGroupRegex: RegExp[]): ArrayPackageGroup {
  const peerDependencies = readPackageJsonForProject(context).peerDependencies ?? {};
  return convertToPackageGroup(peerDependencies, packageGroupRegex);
}

function getPackageGroup(context: ExecutorContext, packageGroupRegex: RegExp[]): ArrayPackageGroup {
  return mergePackageGroup(getPackageGroupFromPeerDependencies(context, packageGroupRegex), getPackageGroupFromDependencies(context, packageGroupRegex));
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


  const packageJson = readPackageJsonForProject(context);

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

  LoadProjectToPackageMapping(context);

  let packageGroup = getPackageGroup(context, packageGroupRegex);
  nxMigrations.packageGroup ??= [];

  if (options.merge) {
    console.log('Merge the package group');
    packageGroup = mergePackageGroup(nxMigrations.packageGroup, packageGroup);
  }

  console.log('set the package group', JSON.stringify(packageGroup, undefined, 2));
  nxMigrations.packageGroup = packageGroup;

  writePackageJsonFormProject(context, packageJson);

  return {
    success: true,
  };
}
