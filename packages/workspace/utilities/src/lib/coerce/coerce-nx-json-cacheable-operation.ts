/**
 * Modifies the `nxJson` object to ensure caching is enabled for specified targets.
 *
 * This function takes an `nxJson` object which may contain a `targetDefaults` property.
 * The `targetDefaults` is a dictionary where each key is a target name and the value is an object
 * that may have a `cache` property. This function ensures that for each target name provided in `nameList`,
 * the `cache` property is set to `true`.
 *
 * If `targetDefaults` does not exist on the `nxJson` object, it is initialized as an empty object.
 * Similarly, if a specific target does not exist within `targetDefaults`, it is also initialized as an empty object
 * before setting the `cache` property to `true`.
 *
 * @param {Object} nxJson - The NX configuration object which may contain target default settings.
 * @param {string[]} nameList - An array of target names for which caching should be enabled.
 */
export function CoerceNxJsonCacheableOperation(
  nxJson: {
    targetDefaults?: Record<string, { cache?: boolean }>
  },
  ...nameList: string[]
) {
  nxJson.targetDefaults ??= {};
  for (const target of nameList) {
    nxJson.targetDefaults[target] ??= {};
    nxJson.targetDefaults[target].cache = true;
  }
}
