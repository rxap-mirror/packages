import { NxJsonConfiguration } from '@nx/devkit';
import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import { Strategy } from '@rxap/workspace-utilities';

export function CoerceNxJsonGenerators(
  nxJson: NxJsonConfiguration,
  name: string,
  options: Record<string, unknown>,
  strategy: Strategy = Strategy.DEFAULT,
) {

  nxJson.generators ??= {};

  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.generators[name] ??= options;
      break;
    case Strategy.OVERWRITE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options);
      break;
    case Strategy.MERGE:
      nxJson.generators[name] ??= options;
      nxJson.generators[name] = deepMerge(nxJson.generators[name], options, MergeDeepLeft);
      break;
    case Strategy.REPLACE:
      nxJson.generators[name] = options;
      break;
  }

}
