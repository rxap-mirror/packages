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
} | RuntimeInputDefinition | {
  externalDependencies: string[];
} | {
  dependentTasksOutputFiles: string;
  transitive?: boolean;
} | EnvInputDefinition | string;

export type EnvInputDefinition = {
  env: string;
}

export type RuntimeInputDefinition = {
  runtime: string;
}

export function IsEnvInputDefinition(input: InputDefinition): input is EnvInputDefinition {
  return typeof input !== 'string' && Object.keys(input).includes('env');
}

export function IsRuntimeInputDefinition(input: InputDefinition): input is RuntimeInputDefinition {
  return typeof input !== 'string' && Object.keys(input).includes('runtime');
}

export type TargetInputs = InputDefinition[];

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
  const targetInputs = nxJson.targetDefaults[target].inputs as TargetInputs;
  for (const input of inputs) {
    if (typeof input === 'string') {
      if (!targetInputs.includes(input)) {
        targetInputs.push(input);
      }
    } else {
      switch (true) {

        case IsEnvInputDefinition(input):
          if (!targetInputs.find(
            targetInput => IsEnvInputDefinition(targetInput) && IsEnvInputDefinition(input) && targetInput['env'] ===
                           input['env'])) {
            targetInputs.push(input);
          }
          break;

        case IsRuntimeInputDefinition(input):
          if (!targetInputs.find(
            targetInput => IsRuntimeInputDefinition(targetInput) && IsRuntimeInputDefinition(input) &&
                           targetInput['runtime'] === input['runtime'])) {
            targetInputs.push(input);
          }
          break;

        default:
          throw new Error('Not yet implemented');

      }
    }
  }
}
