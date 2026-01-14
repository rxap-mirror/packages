import { chain } from '@angular-devkit/schematics';
import {
  buildOperationId,
  CoerceOperation,
  CoerceOperationTableActionRule,
} from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { NormalizedOperationTableActionOptions } from './normalize-operation-table-action-options';

export function openApiOperationRule(normalizedOptions: NormalizedOperationTableActionOptions) {

  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    priority,
    checkFunction,
    tableName,
    project,
    feature,
    shared,
    directory,
    nestModule,
    controllerName,
    type,
    scope,
    backend,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce table action method class ...'),
    CoerceOperationTableActionRule({
      scope,
      directory: join(directory ?? '', 'methods', 'action'),
      operationId: buildOperationId(
        normalizedOptions,
        `${ type }-action`,
        controllerName,
      ),
      type,
      tableName,
      refresh,
      confirm,
      tooltip,
      errorMessage,
      successMessage,
      priority,
      checkFunction,
      project,
      feature,
    }),
    () => console.log('Coerce table action method operation ...'),
    CoerceOperation({
      controllerName,
      nestModule,
      project,
      feature,
      shared,
      overwrite,
      backend,
      overwriteControllerPath: true,
      operationName: `${ type }-action`,
      tsMorphTransform: () => {
        return {
          method: 'put',
          path: `action/:rowId/${ type }`,
          paramList: [ { name: 'rowId' } ],
        };
      },
    }),
  ]);

}