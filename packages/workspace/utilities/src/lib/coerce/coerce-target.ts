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
  defaultConfiguration?: string;
}

export interface NxJsonOrProjectConfiguration extends Record<string, any> {
  targets?: Record<string, TargetConfiguration>;
  targetDefaults?: Record<string, TargetConfiguration>;
}

export enum Strategy {
  /**
   * Only add the target if it does not exist
   */
  DEFAULT = 'default',
  /**
   * Deep merge the target with the existing target. With a deep right merge.
   * Existing property values are overwritten.
   */
  OVERWRITE = 'overwrite',
  /**
   * Deep merge the target with the existing target. With a deep left merge.
   * Existing property values are not overwritten.
   */
  MERGE = 'merge',
  /**
   * Replace the existing target with the new target
   */
  REPLACE = 'replace',
}

export function CoerceTarget(
  projectConfiguration: NxJsonOrProjectConfiguration,
  name: string,
  target: TargetConfiguration = {},
  strategy = Strategy.DEFAULT,
) {

  if (!projectConfiguration.targetDefaults && !projectConfiguration.targets) {
    if ((
          projectConfiguration as any
        ).name || (
          projectConfiguration as any
        ).projectType) {
      projectConfiguration.targets = {};
    } else {
      projectConfiguration.targetDefaults = {};
    }
  }

  const targets = projectConfiguration.targets ?? projectConfiguration.targetDefaults!;

  if (!targets[name]) {
    targets[name] = target;
  } else {
    switch (strategy) {
      case Strategy.DEFAULT:
        break;
      case Strategy.OVERWRITE:
        targets[name] = deepMerge(targets[name], target);
        break;
      case Strategy.MERGE:
        targets[name] = deepMerge(targets[name], target, MergeDeepLeft);
        break;
      case Strategy.REPLACE:
        targets[name] = target;
        break;
    }
  }

  if (projectConfiguration.targetDefaults) {
    projectConfiguration.targetDefaults = targets;
  } else {
    projectConfiguration.targets = targets;
  }

}
