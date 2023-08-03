export type InputDefinition = {
  input: string;
  projects: string | string[];
} | {
  input: string;
  dependencies: true;
} | {
  input: string;
} | {
  fileset: string;
} | {
  runtime: string;
} | {
  externalDependencies: string[];
} | {
  dependentTasksOutputFiles: string;
  transitive?: boolean;
} | {
  env: string;
};

export type TargetInputs = Array<string | InputDefinition>

export interface NxJsonWithInputDefaults {
  targetDefaults?: Record<string, { inputs?: TargetInputs }>;
}

export function CoerceTargetDefaultsInput(
  nxJson: NxJsonWithInputDefaults,
  target: string,
  ...inputs: TargetInputs
) {
  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults[target] ??= {};
  nxJson.targetDefaults[target].inputs ??= [];
  const targetInputs = nxJson.targetDefaults[target].inputs as string[];
  for (const input of inputs) {
    if (typeof input === 'string') {
      if (!targetInputs.includes(input)) {
        targetInputs.push(input);
      }
    } else {
      throw new Error('Not yet implemented');
    }
  }
}
