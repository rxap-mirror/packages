import {ExecutorContext} from '@nx/devkit';

export function GetProjectConfiguration(context: ExecutorContext, projectName = context.projectName) {
  const {projectsConfigurations} = context;

  if (!projectsConfigurations) {
    throw new Error('The projectsConfigurations is undefined. Ensure the projectsConfigurations is passed into the executor context.');
  }

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  const projectConfiguration = projectsConfigurations.projects[projectName];

  if (!projectConfiguration) {
    throw new Error(`The project configuration for project '${projectName}' not found!`);
  }

  return projectConfiguration;
}

export function GetProjectRoot(context: ExecutorContext, projectName = context.projectName): string {
  const projectConfiguration = GetProjectConfiguration(context, projectName);
  return projectConfiguration.root;
}

export function GetProjectSourceRoot(context: ExecutorContext, projectName = context.projectName): string | undefined {
  const projectConfiguration = GetProjectConfiguration(context, projectName);
  return projectConfiguration.sourceRoot;
}
