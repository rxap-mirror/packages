export function CoerceNxJsonCacheableOperation(
  nxJson: { tasksRunnerOptions?: { default?: { runner: string, options?: { cacheableOperations?: string[] } } } },
  ...nameList: string[]
) {
  if (nxJson.tasksRunnerOptions?.default?.runner === 'nx-cloud') {
    nxJson.tasksRunnerOptions.default.options ??= {};
    nxJson.tasksRunnerOptions.default.options = {
      ...nxJson.tasksRunnerOptions.default.options,
      cacheableOperations: [
        ...nxJson.tasksRunnerOptions.default.options.cacheableOperations ?? [],
        ...nameList,
      ].filter((value, index, array) => array.indexOf(value) === index),
    };
  } else {
    console.warn(
      'The nx cloud tasks runner is not configured. The cacheable operations will not be added to the nx.json file.');
  }
}
