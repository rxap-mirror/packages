import { ExecutorContext } from '@nx/devkit';
import { getDirectPackageDependenciesForProject } from './get-direct-package-dependencies-for-project';
import { PackageNameToProjectName } from './project-package-name-mapping';

/**
 * Get the all package dependencies for the project.
 *
 * All package dependencies are the dependent projects that are directly and indirect referenced by the project.
 * This includes the dependencies of the dependent projects.
 *
 * @param context
 * @param projectName
 */
export function GetAllPackageDependenciesForProject(
  context: ExecutorContext,
  projectName = context.projectName,
  resolvedDependencies: Record<string, string> = {},
): Record<string, string> {
  const { projectGraph } = context;

  if (!projectGraph) {
    throw new Error('The projectGraph is undefined. Ensure the projectGraph is passed into the executor context.');
  }

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  const directDependencies = getDirectPackageDependenciesForProject(context, projectName);

  const allDependencies = { ...directDependencies };

  for (const packageName of Object.keys(directDependencies)) {

    if (resolvedDependencies[packageName]) {
      continue;
    }

    const project = PackageNameToProjectName(packageName);

    const dependencies = GetAllPackageDependenciesForProject(context, project, directDependencies);

    Object.assign(allDependencies, dependencies);

  }

  return allDependencies;

}
