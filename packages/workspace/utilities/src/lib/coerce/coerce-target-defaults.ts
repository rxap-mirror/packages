import {
  NxJsonConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import { Strategy } from './coerce-target';

/**
 * Modifies the `targetDefaults` property of the provided `nxJson` configuration object by setting or updating
 * the target configuration for a specified name based on the provided strategy.
 *
 * @param {NxJsonConfiguration} nxJson - The Nx workspace configuration object which contains the `targetDefaults`.
 * @param {string} name - The name of the target configuration to modify or set.
 * @param {Partial<TargetConfiguration>} target - The target configuration values to apply.
 * @param {Strategy} [strategy=Strategy.DEFAULT] - The strategy to use when updating the target configuration:
 * - `Strategy.DEFAULT`: Does nothing if the target configuration already exists.
 * - `Strategy.OVERWRITE`: Deeply merges the existing configuration with the new one, with new values taking precedence.
 * - `Strategy.MERGE`: Deeply merges the existing configuration with the new one, with existing values taking precedence.
 * - `Strategy.REPLACE`: Replaces the existing configuration with the new one entirely.
 *
 * Ensures that `targetDefaults` is initialized if it does not already exist in `nxJson`.
 */
export function CoerceTargetDefaults(
  nxJson: NxJsonConfiguration,
  name: string,
  target: Partial<TargetConfiguration>,
  strategy = Strategy.DEFAULT,
) {

  nxJson.targetDefaults ??= {};
  if (!nxJson.targetDefaults[name]) {
    nxJson.targetDefaults[name] = target;
  } else {
    switch (strategy) {
      case Strategy.DEFAULT:
        break;
      case Strategy.OVERWRITE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target);
        break;
      case Strategy.MERGE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target, MergeDeepLeft);
        break;
      case Strategy.REPLACE:
        nxJson.targetDefaults[name] = target;
        break;
    }
  }

}
