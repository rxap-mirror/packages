import { UpdatePackageGroupExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import {
  ArrayPackageGroup,
  normalizePackageGroup,
  PackageGroup,
} from 'nx/src/utils/package-json';
import {
  getDirectPackageDependenciesForProject,
  readPackageJsonForProject,
  writePackageJsonFormProject,
} from '@rxap/plugin-utilities';

function getPackageGroup(context: ExecutorContext): ArrayPackageGroup {
  const directPackageDependencies = getDirectPackageDependenciesForProject(context);
  return Object.entries(directPackageDependencies)
               .map(([ packageName, version ]) => ({
                 package: packageName,
                 version: version,
               }));
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

  nxMigrations.packageGroup ??= [];
  nxMigrations.packageGroup = mergePackageGroup(nxMigrations.packageGroup, getPackageGroup(context));

  writePackageJsonFormProject(context, packageJson);

  return {
    success: true,
  };
}
