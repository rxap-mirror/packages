import { NxJsonConfiguration } from '@nx/devkit';
import { Strategy } from '@rxap/workspace-utilities';

export function CoerceNxJsonNamedInputs(
  nxJson: NxJsonConfiguration,
  name: string,
  pattern: string[],
  strategy: Strategy = Strategy.DEFAULT,
) {
  nxJson.namedInputs ??= {};
  switch (strategy) {
    case Strategy.DEFAULT:
      nxJson.namedInputs[name] ??= pattern;
      break;
    case Strategy.OVERWRITE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.MERGE:
      nxJson.namedInputs[name] = pattern;
      break;
    case Strategy.REPLACE:
      nxJson.namedInputs[name] = pattern;
      break;
  }
}
