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

/**
 * Checks if the provided input conforms to the `EnvInputDefinition` interface.
 *
 * This function determines if the given `input` is not a string and contains the key 'env',
 * which is a characteristic of an `EnvInputDefinition`. It uses TypeScript's type predicate
 * to assert the type of `input` at runtime.
 *
 * @param input - The input to be checked, which can be of type `InputDefinition`.
 * @returns A boolean value, `true` if `input` matches the `EnvInputDefinition` structure, otherwise `false`.
 */
export function IsEnvInputDefinition(input: InputDefinition): input is EnvInputDefinition {
  return typeof input !== 'string' && Object.keys(input).includes('env');
}

/**
 * Determines if the provided input conforms to the RuntimeInputDefinition interface.
 *
 * This function checks if the given input is not a string and if it includes a property named 'runtime'.
 * It is a type guard function used to assert the type of the input at runtime.
 *
 * @param input - The input to be checked, which can be of type InputDefinition.
 * @returns True if the input is not a string and contains the 'runtime' property, otherwise false.
 *
 * @example
 * const inputExample = { runtime: 'node', version: '14.x' };
 * if (IsRuntimeInputDefinition(inputExample)) {
 * console.log('The input is a valid RuntimeInputDefinition');
 * } else {
 * console.log('The input is not a valid RuntimeInputDefinition');
 * }
 */
export function IsRuntimeInputDefinition(input: InputDefinition): input is RuntimeInputDefinition {
  return typeof input !== 'string' && Object.keys(input).includes('runtime');
}

export type TargetInputs = InputDefinition[];

export interface NxJsonWithInputDefaults {
  targetDefaults?: Record<string, { inputs?: TargetInputs }>;
}

/**
 * Ensures that the specified target within the `nxJson` configuration object has a default set of inputs,
 * and merges additional inputs provided via the `inputs` parameter. This function modifies the `nxJson`
 * object directly to include these defaults and additional inputs.
 *
 * @param {NxJsonWithInputDefaults} nxJson - The Nx workspace configuration object which includes target defaults.
 * @param {string} target - The name of the target for which the inputs should be coerced.
 * @param {...TargetInputs} inputs - A variable number of input definitions (either strings or input objects) to be added to the target.
 *
 * The function first ensures that the `targetDefaults` and the specific `target` entry exist on the `nxJson` object.
 * It then ensures that an `inputs` array is present for the specified `target`. Each input in the `inputs` parameter
 * is processed and added to the `target`'s `inputs` array if it does not already exist. The uniqueness of each input
 * is determined based on its type:
 *
 * - For string inputs, they are added if they are not already present in the array.
 * - For object inputs (environment or runtime inputs), they are added based on unique properties (`env` or `runtime`).
 *
 * If an input type is not recognized, the function throws an error indicating that the input type has not been implemented.
 *
 * This function is useful for setting up and ensuring consistency in the configuration of build targets in an Nx workspace,
 * especially when dealing with multiple environments or runtime configurations.
 *
 * @throws {Error} Throws an error if an input type is not recognized or not yet implemented.
 */
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
