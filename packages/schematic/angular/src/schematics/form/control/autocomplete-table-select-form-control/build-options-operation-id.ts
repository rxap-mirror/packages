import {
  BuildNestControllerName,
  buildOperationId,
} from '@rxap/schematics-ts-morph';
import { buildOptionsOperationName } from './build-options-operation-name';
import { NormalizedTableSelectFormControlOptions } from './normalize-table-select-form-control-options';

export function buildOptionsOperationId(normalizedOptions: NormalizedTableSelectFormControlOptions) {
  return buildOperationId(
    normalizedOptions,
    buildOptionsOperationName(normalizedOptions),
    BuildNestControllerName(normalizedOptions),
  );
}