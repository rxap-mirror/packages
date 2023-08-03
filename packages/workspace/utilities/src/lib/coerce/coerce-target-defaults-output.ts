export interface NxJsonWithOutputDefaults {
  targetDefaults?: Record<string, { outputs?: string[] }>;
}

export function CoerceTargetDefaultsOutput(
  nxJson: NxJsonWithOutputDefaults,
  target: string,
  ...outputs: string[]
) {
  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults[target] ??= {};
  nxJson.targetDefaults[target].outputs ??= [];
  const targetOutputs = nxJson.targetDefaults[target].outputs as string[];
  for (const output of outputs) {
    if (!targetOutputs.includes(output)) {
      targetOutputs.push(output);
    }
  }
}
