import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { NormalizedDataGridComponentOptions } from './normalize-data-grid-component-options';

export function buildGetOperationId(normalizedOptions: NormalizedDataGridComponentOptions) {
  const { identifier } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    BuildNestControllerName(normalizedOptions),
  );
}