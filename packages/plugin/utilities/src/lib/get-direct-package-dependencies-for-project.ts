import { ExecutorContext } from '@nx/devkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { GetProjectRoot } from './project';
import { readPackageJsonForProject } from './project-package-json';

/**
 * Get the direct package dependencies for the project.
 *
 * The direct package dependencies are the dependent projects that are directly referenced by the project.
 *
 * @param context
 * @param projectName
 */
export function getDirectPackageDependenciesForProject(
  context: ExecutorContext,
  projectName = context.projectName,
): Record<string, string> {
  const { projectGraph } = context;

  if (!projectGraph) {
    throw new Error('The projectGraph is undefined. Ensure the projectGraph is passed into the executor context.');
  }

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  if (!projectGraph.dependencies[projectName]) {
    throw new Error(`The project ${ projectName } does not exist in the projectGraph.`);
  }

  return projectGraph.dependencies[projectName]
    .filter(dependency => !dependency.target.startsWith('npm:'))
    .map(dependency => dependency.target)
    .filter(name => existsSync(join(context.root, GetProjectRoot(context, name), 'package.json')))
    .map(projectName => readPackageJsonForProject(context, projectName) as any)
    .filter(packageJson => !!packageJson.name && packageJson.version)
    .reduce((
      acc,
      {
        name,
        version,
      }: { name: string, version: string },
    ) => ({
      ...acc,
      [name]: version,
    }), {});
}
