import {
  NxJsonConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  deepMerge,
  MergeDeepLeft,
} from '@rxap/utilities';
import { Strategy } from '@rxap/workspace-utilities';

export function CoerceTargetDefaults(
  nxJson: NxJsonConfiguration,
  name: string,
  target: Partial<TargetConfiguration>,
  strategy = Strategy.DEFAULT,
) {

  nxJson.targetDefaults ??= {};
  if (!nxJson.targetDefaults[name]) {
    nxJson.targetDefaults[name] = target;
  } else {
    switch (strategy) {
      case Strategy.DEFAULT:
        break;
      case Strategy.OVERWRITE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target);
        break;
      case Strategy.MERGE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target, MergeDeepLeft);
        break;
      case Strategy.REPLACE:
        nxJson.targetDefaults[name] = target;
        break;
    }
  }

}
