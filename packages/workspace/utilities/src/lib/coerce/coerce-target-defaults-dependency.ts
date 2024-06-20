import { equals } from '@rxap/utilities';

export type NxJsonTargetDependsOn = string | { target: string, projects?: string | string[] };

export interface NxJsonWithTargetDefaults {
  targetDefaults?: Record<string, { dependsOn?: Array<NxJsonTargetDependsOn> }>;
}

/**
 * Modifies the `nxJson` object to ensure that the specified `target` has a default dependency configuration,
 * and appends new dependencies from `dependsOnList` if they are not already present.
 *
 * This function first ensures that the `targetDefaults` and the specific `target` within it exist on the `nxJson` object.
 * If they do not exist, they are initialized to their default states (empty objects and arrays as appropriate).
 * It then iterates over the `dependsOnList`, adding each dependency to the `target`'s `dependsOn` array if it is not
 * already included. This inclusion check handles both string and object types of dependencies, ensuring no duplicates.
 *
 * @param {NxJsonWithTargetDefaults} nxJson - The Nx configuration object which includes target defaults.
 * @param {string} target - The name of the target for which the dependencies are being set or updated.
 * @param {...NxJsonTargetDependsOn[]} dependsOnList - A variable number of dependency configurations (either strings or objects)
 * that should be added to the target's dependency list if not already present.
 */
export function CoerceTargetDefaultsDependency(
  nxJson: NxJsonWithTargetDefaults,
  target: string,
  ...dependsOnList: NxJsonTargetDependsOn[]
) {
  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults[target] ??= {};
  nxJson.targetDefaults[target].dependsOn ??= [];
  const targetDependsOn = nxJson.targetDefaults[target].dependsOn as Array<NxJsonTargetDependsOn>;
  for (const dependsOn of dependsOnList) {
    if (typeof dependsOn === 'string') {
      if (!targetDependsOn.includes(dependsOn)) {
        targetDependsOn.push(dependsOn);
      }
    } else {
      if (!targetDependsOn.some(d => equals(d, dependsOn))) {
        targetDependsOn.push(dependsOn);
      }
    }
  }
}
