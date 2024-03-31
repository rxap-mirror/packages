import {
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';

export function GetTargetConfigurationNameList(
  projectConfiguration: ProjectConfiguration,
  targetName: string,
): string[] {
  const configurationNameList: string[] = [];
  if (projectConfiguration.targets && projectConfiguration.targets[targetName]) {
    return Object.keys(projectConfiguration.targets[targetName].configurations ?? {});
  }
  return configurationNameList;
}

export function CreateConfigurationMapMatchingWithTarget(
  projectConfiguration: ProjectConfiguration,
  targetName: string,
): Record<string, Record<string, unknown>> {
  return GetTargetConfigurationNameList(projectConfiguration, 'build')
    .reduce((acc, configurationName) => ({
      ...acc,
      [configurationName]: {},
    }), {});
}

export function GetTarget(projectConfiguration: ProjectConfiguration, targetName: string) {
  if (projectConfiguration.targets && projectConfiguration.targets[targetName]) {
    return projectConfiguration.targets[targetName];
  }
  throw new Error(`Could not find target '${ targetName }' for project '${ projectConfiguration.name }'`);
}

export function GetTargetOptions<T = Record<string, unknown>>(
  projectTarget: TargetConfiguration,
  configurationName?: string,
): T {
  const options = projectTarget.options ?? {};
  if (configurationName) {
    if (projectTarget.configurations && projectTarget.configurations[configurationName]) {
      Object.assign(options, projectTarget.configurations[configurationName]);
    }
  }
  return options;
}
