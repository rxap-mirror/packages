import { NxJsonConfiguration } from '@nx/devkit';
import { Strategy } from '@rxap/workspace-utilities';

/**
 * Modifies the `namedInputs` property of a given NxJsonConfiguration object based on the specified strategy.
 *
 * This function allows for the dynamic configuration of named inputs within an NxJsonConfiguration object,
 * which is typically used to manage project-specific settings in Nx workspaces.
 *
 * @param {NxJsonConfiguration} nxJson - The NxJsonConfiguration object to be modified.
 * @param {string} name - The key under which the input patterns should be stored or modified.
 * @param {string[]} pattern - An array of input patterns to be associated with the specified name.
 * @param {Strategy} [strategy=Strategy.DEFAULT] - The strategy to use when modifying the named inputs.
 * The available strategies are:
 * - Strategy.DEFAULT: Sets the named input only if it does not already exist.
 * - Strategy.OVERWRITE: Overwrites the existing named input with the new pattern.
 * - Strategy.MERGE: Merges the new pattern with the existing named input (currently behaves like OVERWRITE).
 * - Strategy.REPLACE: Replaces the existing named input with the new pattern (currently behaves like OVERWRITE).
 */
export function CoerceNxJsonNamedInputs(
  nxJson: NxJsonConfiguration,
  name: string,
  pattern: string[],
  strategy: Strategy = Strategy.DEFAULT,
) {
  nxJson.namedInputs ??= {};
  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.namedInputs[name] ??= pattern;
      break;
    case Strategy.OVERWRITE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.MERGE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.REPLACE:
      nxJson.namedInputs[name] = pattern;
      break;
  }
}
