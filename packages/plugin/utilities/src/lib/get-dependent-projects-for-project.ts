import { ExecutorContext } from '@nx/devkit';

export function GetDependentProjectsForProject(
  context: ExecutorContext,
  projectName = context.projectName,
  resolved: string[] = [],
  ) {

  const { projectGraph } = context;

  if (!projectGraph) {
    throw new Error('The projectGraph is undefined. Ensure the projectGraph is passed into the executor context.');
  }

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  const directDependencies = projectGraph.dependencies[projectName];

  if (!directDependencies) {
    throw new Error(`The project "${ projectName }" does not exists in the project graph.`);
  }

  // Get the list of project dependencies that are not already resolved
  const projectDependencies = directDependencies
    .map(dep => dep.target)
    .filter(name => !name.startsWith('npm:'))
    .filter(name => !resolved.includes(name));

  // Add the current direct dependencies to the list of resolved dependencies
  resolved = [ ...resolved, ...projectDependencies ];
  for (const project of projectDependencies) {
    // Proceed recursively with the extended list of resolved dependencies
    resolved = GetDependentProjectsForProject(context, project, resolved);
  }

  return resolved;

}
