import { ExecutorContext } from '@nx/devkit';
import { GetTargetOptions } from './get-target-configuration-name-list';
import { GetProjectConfiguration } from './project';

export function GetProjectTarget(context: ExecutorContext, projectName: string, targetName: string) {
  const projectConfiguration = GetProjectConfiguration(context, projectName);

  const targetConfiguration = projectConfiguration.targets ? projectConfiguration.targets[targetName] : undefined;

  if (!targetConfiguration) {
    throw new Error(`The target configuration for target '${ targetName }' not found!`);
  }

  return targetConfiguration;
}

export function GetProjectTargetOptions(
  context: ExecutorContext,
  projectName: string,
  targetName: string,
  configurationName = context.configurationName,
) {
  const target = GetProjectTarget(context, projectName, targetName);
  return GetTargetOptions(target, configurationName);
}
