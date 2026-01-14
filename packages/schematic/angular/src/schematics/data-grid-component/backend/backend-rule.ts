import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedDataGridComponentOptions } from '../normalize-data-grid-component-options';
import { localBackendRule } from './local-backend-rule';
import { nestjsBackendRule } from './nestjs-backend-rule';

export function backendRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);

  }

  return noop();

}