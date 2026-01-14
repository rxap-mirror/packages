import {
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedTableComponentOptions } from '../normalize-table-component-options';
import { localBackendRule } from './local-backend-rule';
import { nestjsBackendRule } from './nestjs-backend-rule';
import { openApiBackendRule } from './open-api-backend-rule';

export function backendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {
  const {
    backend,
  } = normalizedOptions;
  switch (backend.kind) {
    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);
    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);
    case BackendTypes.OPEN_API:
      return openApiBackendRule(normalizedOptions);
  }
  return noop();
}