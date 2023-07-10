import { UpdateDependenciesExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';
import {
  getDirectPackageDependenciesForProject,
  readPackageJsonForProject,
  writePackageJsonFormProject,
} from '@rxap/plugin-utilities';


function replaceVersionWithCurrentVersion(
  dependencies: Record<string, string> = {},
  context: ExecutorContext,
) {

  const directPackageDependencies = getDirectPackageDependenciesForProject(context);

  for (const [ packageName ] of Object.entries(dependencies)) {
    console.log(`Check if ${packageName} is a direct dependency`);
    if (directPackageDependencies[packageName]) {
      dependencies[packageName] = '^' + directPackageDependencies[packageName];
      console.log(`Updated the version of ${packageName} to ${directPackageDependencies[packageName]}`);
    } else {
      console.log(`Skip ${packageName} because it is not a direct dependency`);
    }
  }

}

export default async function runExecutor(
  options: UpdateDependenciesExecutorSchema,
  context: ExecutorContext,
) {
  const packageJson = readPackageJsonForProject(context);

  const {
    dependencies,
    peerDependencies,
    optionalDependencies
  } = packageJson;

  replaceVersionWithCurrentVersion(dependencies, context);
  replaceVersionWithCurrentVersion(peerDependencies, context);
  replaceVersionWithCurrentVersion(optionalDependencies, context);

  writePackageJsonFormProject(context, packageJson);

  return {
    success: true,
  };
}
