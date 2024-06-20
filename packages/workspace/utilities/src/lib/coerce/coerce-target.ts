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

/**
 * Modifies or initializes the target configuration for a given project based on the specified strategy.
 *
 * This function takes a project configuration object and a target name, and optionally a target configuration object
 * and a strategy for merging configurations. It ensures that the project configuration has either `targets` or
 * `targetDefaults` initialized. If the target by the given name does not exist, it will be added. If it does exist,
 * the function will merge or replace the existing configuration based on the provided strategy.
 *
 * @param {NxJsonOrProjectConfiguration} projectConfiguration - The project configuration object which should either
 * have a `targets` or `targetDefaults` property.
 * @param {string} name - The name of the target configuration to modify or add.
 * @param {TargetConfiguration} [target={}] - The target configuration object to be merged or set. Defaults to an empty object.
 * @param {Strategy} [strategy=Strategy.DEFAULT] - The strategy to use when merging target configurations. Defaults to `Strategy.DEFAULT`.
 * Possible strategies include:
 * - `Strategy.DEFAULT`: No action is taken if the target already exists.
 * - `Strategy.OVERWRITE`: The existing target configuration is deeply merged with the new configuration, with new properties overwriting existing ones.
 * - `Strategy.MERGE`: Similar to `OVERWRITE`, but merges in such a way that existing properties are preserved unless explicitly overwritten.
 * - `Strategy.REPLACE`: Completely replaces the existing target configuration with the new one.
 *
 * @remarks
 * The function modifies the `projectConfiguration` object directly, and the changes reflect on the object passed as an argument.
 * It is assumed that `deepMerge` is a function defined elsewhere in the codebase that handles deep merging of objects.
 * The `MergeDeepLeft` option in the `Strategy.MERGE` case is also assumed to be defined elsewhere, specifying the merge behavior.
 */
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
