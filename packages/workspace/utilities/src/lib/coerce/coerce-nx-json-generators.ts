import { NxJsonConfiguration } from '@nx/devkit';
import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import { Strategy } from '@rxap/workspace-utilities';

/**
 * Modifies the `generators` property of the provided `nxJson` configuration object based on the specified strategy.
 *
 * This function allows for the dynamic configuration of generator options within an Nx workspace by modifying the `nxJson` object.
 *
 * @param {NxJsonConfiguration} nxJson - The Nx JSON configuration object which contains settings specific to the Nx workspace.
 * @param {string} name - The name of the generator to configure.
 * @param {Record<string, unknown>} options - A record of the options to be applied to the generator.
 * @param {Strategy} [strategy=Strategy.DEFAULT] - The strategy to use when applying the options. The strategies include:
 * - `DEFAULT`: Sets the generator options only if they are not already set.
 * - `OVERWRITE`: Merges the new options with existing ones, with new values overwriting any existing ones.
 * - `MERGE`: Merges new options with existing ones, but existing values take precedence over new ones.
 * - `REPLACE`: Completely replaces any existing options with the new ones.
 *
 * @remarks
 * The function ensures that the `generators` property exists on the `nxJson` object, initializing it if necessary.
 * Depending on the chosen strategy, the function either modifies existing generator configurations or sets new ones.
 * The merging behavior for the `OVERWRITE` and `MERGE` strategies is handled by the `deepMerge` function, which needs to be defined elsewhere in the codebase.
 *
 * @example
 * // Assuming `nxJson` is your Nx configuration object and you want to add or modify the configuration for a "build" generator:
 * CoerceNxJsonGenerators(nxJson, 'build', { options: { outputPath: './dist' } }, Strategy.MERGE);
 */
export function CoerceNxJsonGenerators(
  nxJson: NxJsonConfiguration,
  name: string,
  options: Record<string, unknown>,
  strategy: Strategy = Strategy.DEFAULT,
) {

  nxJson.generators ??= {};

  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.generators[name] ??= options;
      break;
    case Strategy.OVERWRITE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options);
      break;
    case Strategy.MERGE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options, MergeDeepLeft);
      break;
    case Strategy.REPLACE:
      nxJson.generators[name] = options;
      break;
  }

}
