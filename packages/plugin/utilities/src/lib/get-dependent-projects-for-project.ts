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

  // Get the list of project dependencies that are not already resolved
  const newDependentProjects = projectGraph.dependencies[projectName]
    .map(dep => dep.target)
    .filter(name => !name.startsWith('npm:'))
    .filter(name => !resolved.includes(name));

  let subDependentProjects: string[] = [];
  for (const project of newDependentProjects) {
    subDependentProjects = [ ...subDependentProjects, ...GetDependentProjectsForProject(context, project, [ ...resolved, ...newDependentProjects ]) ];
  }

  return [ ...newDependentProjects, ...resolved ];

}
