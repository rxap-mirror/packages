import { countTokens } from './count-tokens';
import {
  Model,
  tokenLimits,
} from './model';

export function assertTokenLimit(model: Model, ...inputs: string[]) {

  const sum = inputs.reduce((sum, input) => sum + countTokens(model, input), 0);

  if (sum > tokenLimits[model][0] * 0.8) {
    throw new Error(`The input has '${sum}' tokens and the model has a limit of ${tokenLimits[model][0] * 0.8}`);
  }

}
