import { equals } from '@rxap/utilities';

export type NxJsonTargetDependsOn = string | { target: string, projects?: string | string[] };

export interface NxJsonWithTargetDefaults {
  targetDefaults?: Record<string, { dependsOn?: Array<NxJsonTargetDependsOn> }>;
}

export function CoerceTargetDefaultsDependency(
  nxJson: NxJsonWithTargetDefaults,
  target: string,
  dependsOn: NxJsonTargetDependsOn,
) {
  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults[target] ??= {};
  nxJson.targetDefaults[target].dependsOn ??= [];
  const targetDependsOn = nxJson.targetDefaults[target].dependsOn as Array<NxJsonTargetDependsOn>;
  if (typeof dependsOn === 'string') {
    if (!targetDependsOn.includes(dependsOn)) {
      targetDependsOn.push(dependsOn);
    }
  } else {
    if (!targetDependsOn.some(d => equals(d, dependsOn))) {
      targetDependsOn.push(dependsOn);
    }
  }
}
