import { UpdateDependenciesExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';
import {
  getDirectPackageDependenciesForProject,
  getDirectPackageDependenciesForProjectWihRetry,
  readPackageJsonForProject,
  readPackageJsonForProjectWithRetry,
  writePackageJsonFormProject,
} from '@rxap/plugin-utilities';


async function replaceVersionWithCurrentVersion(
  dependencies: Record<string, string> = {},
  context: ExecutorContext,
) {

  const directPackageDependencies = await getDirectPackageDependenciesForProjectWihRetry(context);

  for (const [ packageName ] of Object.entries(dependencies)) {
    console.log(`Check if ${ packageName } is a direct dependency`);
    if (directPackageDependencies[packageName]) {
      dependencies[packageName] = '^' + directPackageDependencies[packageName];
      console.log(`Updated the version of ${ packageName } to ${ directPackageDependencies[packageName] }`);
    } else {
      console.log(`Skip ${ packageName } because it is not a direct dependency`);
    }
  }

}

export default async function runExecutor(
  options: UpdateDependenciesExecutorSchema,
  context: ExecutorContext,
) {
  const packageJson = await readPackageJsonForProjectWithRetry(context);

  const {
    dependencies,
    peerDependencies,
    optionalDependencies,
  } = packageJson;

  await replaceVersionWithCurrentVersion(dependencies, context);
  await replaceVersionWithCurrentVersion(peerDependencies, context);
  await replaceVersionWithCurrentVersion(optionalDependencies, context);

  writePackageJsonFormProject(context, packageJson);

  return {
    success: true,
  };
}
