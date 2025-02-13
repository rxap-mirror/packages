import { ExecutorContext } from '@nx/devkit';
import { GetTargetOptions } from '@rxap/workspace-utilities';
import { GetProjectConfiguration } from './project';

export function HasProjectTarget(context: ExecutorContext, projectName = context.projectName, targetName: string) {
  const projectConfiguration = GetProjectConfiguration(context, projectName);

  return !!projectConfiguration.targets?.[targetName];
}

export function GetProjectTarget(context: ExecutorContext, projectName = context.projectName, targetName: string) {
  const projectConfiguration = GetProjectConfiguration(context, projectName);

  const targetConfiguration = projectConfiguration.targets ? projectConfiguration.targets[targetName] : undefined;

  if (!targetConfiguration) {
    throw new Error(`The target configuration for target '${ targetName }' in project '${ projectName }' not found!`);
  }

  return targetConfiguration;
}

export function GetProjectTargetOptions<T = Record<string, unknown>>(
  context: ExecutorContext,
  projectName: string | undefined = context.projectName,
  targetName: string,
  configurationName = context.configurationName,
): T {
  const target = GetProjectTarget(context, projectName, targetName);
  return GetTargetOptions<T>(target, configurationName);
}
