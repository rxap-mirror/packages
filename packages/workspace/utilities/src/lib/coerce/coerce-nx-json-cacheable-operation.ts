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
