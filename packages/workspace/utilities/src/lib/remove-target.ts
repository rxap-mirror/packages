import { NxJsonOrProjectConfiguration } from '@rxap/workspace-utilities';

export function RemoveTarget(
  projectConfiguration: NxJsonOrProjectConfiguration,
  name: string,
  ) {
  if (projectConfiguration.targets?.[name]) {
    delete projectConfiguration.targets[name];
  }
}
