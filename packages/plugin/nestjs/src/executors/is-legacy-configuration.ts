import { ExecutorContext } from '@nx/devkit';
import { GetProjectConfiguration } from '@rxap/plugin-utilities';

export function isLegacyConfiguration(context: ExecutorContext) {
  return GetProjectConfiguration(context).targets?.['build']?.['executor'] === '@nx/webpack:webpack';
}
