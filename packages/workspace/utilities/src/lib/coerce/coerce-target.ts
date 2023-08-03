import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import { NxJsonTargetDependsOn } from './coerce-target-defaults-dependency';
import { TargetInputs } from './coerce-target-defaults-input';

export interface TargetConfiguration {
  executor?: string;
  options?: Record<string, any>;
  dependsOn?: NxJsonTargetDependsOn[];
  inputs?: TargetInputs;
  outputs?: string[];
  configurations?: Record<string, Record<string, any>>;
}

export interface ProjectConfigurationWithTarget {
  targets?: Record<string, TargetConfiguration>;
}

export enum Strategy {
  DEFAULT = 'default',
  OVERWRITE = 'overwrite',
  MERGE = 'merge',
  REPLACE = 'replace',
}

export function CoerceTarget(
  projectConfiguration: ProjectConfigurationWithTarget,
  name: string,
  target: TargetConfiguration,
  strategy = Strategy.DEFAULT,
) {

  projectConfiguration.targets ??= {};

  if (!projectConfiguration.targets[name]) {
    projectConfiguration.targets[name] = target;
  } else {
    switch (strategy) {
      case Strategy.DEFAULT:
        break;
      case Strategy.OVERWRITE:
        projectConfiguration.targets[name] = deepMerge(projectConfiguration.targets[name], target);
        break;
      case Strategy.MERGE:
        projectConfiguration.targets[name] = deepMerge(projectConfiguration.targets[name], target, MergeDeepLeft);
        break;
      case Strategy.REPLACE:
        projectConfiguration.targets[name] = target;
        break;
    }
  }

}
