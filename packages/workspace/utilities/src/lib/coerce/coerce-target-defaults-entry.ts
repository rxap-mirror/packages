/**
 * Since Nx 23 the value of a `targetDefaults` key is either a plain config object or an ordered array of
 * (optionally filtered) entries. This helper returns the plain, mutable, unfiltered entry for the given key
 * regardless of the shape, creating it if it does not exist yet.
 */
export function CoerceTargetDefaultsEntry(
  targetDefaults: Record<string, any>,
  target: string,
): Record<string, any> {
  const value = targetDefaults[target];
  if (Array.isArray(value)) {
    let entry = value.find((e) => !e.filter);
    if (!entry) {
      entry = {};
      value.push(entry);
    }
    return entry;
  }
  return (targetDefaults[target] ??= {});
}

/**
 * Read-only variant of {@link CoerceTargetDefaultsEntry}: returns the unfiltered entry for the given key
 * (or `undefined`) without modifying the `targetDefaults`.
 */
export function GetTargetDefaultsEntry<T extends Record<string, any> = Record<string, any>>(
  targetDefaults: Record<string, any> | undefined,
  target: string,
): T | undefined {
  const value = targetDefaults?.[target];
  if (Array.isArray(value)) {
    return value.find((e) => !e.filter);
  }
  return value;
}
