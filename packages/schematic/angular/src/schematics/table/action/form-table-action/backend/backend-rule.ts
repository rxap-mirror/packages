import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { nestjsBackendRule } from './nestjs-backend-rule';
import { NormalizedFormTableActionOptions } from '../normalize-form-table-action-options';

export function backendRule(normalizedOptions: NormalizedFormTableActionOptions) {

  const { backend } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}