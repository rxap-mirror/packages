import { buildOperationId } from '@rxap/schematics-ts-morph';
import { NormalizedFormTableActionOptions } from './normalize-form-table-action-options';

export function buildGetOperationId(normalizedOptions: NormalizedFormTableActionOptions) {
  const {
    controllerName,
  } = normalizedOptions;
  if (!controllerName) {
    throw new Error('The controller name is required');
  }
  return buildOperationId(
    normalizedOptions,
    `get`,
    controllerName,
  );
}