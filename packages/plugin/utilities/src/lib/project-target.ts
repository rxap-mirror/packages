import { ExecutorContext } from '@nx/devkit';
import { GetProjectConfiguration } from './project';

export function GetProjectTarget(context: ExecutorContext, projectName: string, targetName: string) {
  const projectConfiguration = GetProjectConfiguration(context, projectName);

  const targetConfiguration = projectConfiguration.targets ? projectConfiguration.targets[targetName] : undefined;

  if (!targetConfiguration) {
    throw new Error(`The target configuration for target '${ targetName }' not found!`);
  }

  return targetConfiguration;
}

export function GetProjectTargetOptions(context: ExecutorContext, projectName: string, targetName: string) {
  const target = GetProjectTarget(context, projectName, targetName);
  return target.options ?? {};
}
