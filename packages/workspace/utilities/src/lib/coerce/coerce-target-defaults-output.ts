import { CoerceTargetDefaultsEntry } from './coerce-target-defaults-entry';

export interface NxJsonWithOutputDefaults {
  targetDefaults?: Record<string, any>;
}

/**
 * Ensures that the specified outputs are included in the `targetDefaults` for a given target within an `NxJsonWithOutputDefaults` object.
 * If the `targetDefaults` or the outputs for the specified target are not defined, they are initialized.
 * Existing outputs for the target are preserved, and only new, non-duplicate outputs are added.
 *
 * @param {NxJsonWithOutputDefaults} nxJson - The Nx JSON configuration object which includes output defaults.
 * @param {string} target - The name of the target for which outputs are being set or updated.
 * @param {...string[]} outputs - A list of output paths to ensure are included for the specified target.
 */
export function CoerceTargetDefaultsOutput(
  nxJson: NxJsonWithOutputDefaults,
  target: string,
  ...outputs: string[]
) {
  nxJson.targetDefaults ??= {};
  const entry = CoerceTargetDefaultsEntry(nxJson.targetDefaults, target);
  entry['outputs'] ??= [];
  const targetOutputs = entry['outputs'] as string[];
  for (const output of outputs) {
    if (!targetOutputs.includes(output)) {
      targetOutputs.push(output);
    }
  }
}
