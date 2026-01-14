import {
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedSelectFormControlOptions } from '../normalize-select-form-control-options';
import { dataSourceBackendOptionsRule } from './data-source-backend-options-rule';
import { nestJsBackendOptionsRule } from './nest-js-backend-options-rule';
import { noneBackendOptionsRule } from './none-backend-options-rule';
import { openApiBackendOptionsRule } from './open-api-backend-options-rule';

export function optionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
  const {
    backend,
    dataSource,
  } = normalizedOptions;
  if (dataSource) {
    return dataSourceBackendOptionsRule(normalizedOptions);
  }
  switch (backend.kind) {
    case BackendTypes.LOCAL:
    case BackendTypes.NONE:
      return noneBackendOptionsRule(normalizedOptions);
    case BackendTypes.NESTJS:
      return nestJsBackendOptionsRule(normalizedOptions);
    case BackendTypes.OPEN_API:
      return openApiBackendOptionsRule(normalizedOptions);
    default:
      throw new SchematicsException(`The backend type "${ backend }" is not supported!`);
  }
}