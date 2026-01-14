import { LoadFromTableActionOptions } from '@rxap/schematics-ts-morph';
import { NormalizedFormTableActionOptions } from './normalize-form-table-action-options';
import { BackendTypes } from '../../../../lib/backend/backend-types';
import { buildGetOperationId } from './build-get-operation-id';

export function buildLoadFormOptions(normalizedOptions: NormalizedFormTableActionOptions): LoadFromTableActionOptions | undefined {

  const { backend } = normalizedOptions;

  let loadFrom: LoadFromTableActionOptions | undefined = undefined;
  if (backend.kind === BackendTypes.NESTJS) {
    loadFrom = {
      operationId: buildGetOperationId(normalizedOptions),
      body: false,
      parameters: {
        rowId: 'rowId',
      },
    };
  } else if (normalizedOptions.loadFrom) {
    loadFrom = normalizedOptions.loadFrom as any;
  }

  return loadFrom;

}