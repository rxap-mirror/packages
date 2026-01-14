import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedOperationTableActionOptions } from './normalize-operation-table-action-options';
import { openApiOperationRule } from './open-api-operation-rule';

export function backendRule(normalizedOptions: NormalizedOperationTableActionOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return openApiOperationRule(normalizedOptions);

  }

  return noop();

}