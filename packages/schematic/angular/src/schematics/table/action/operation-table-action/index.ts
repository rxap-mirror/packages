import {
  chain,
  noop,
  Tree,
} from '@angular-devkit/schematics';
import {
  buildOperationId,
  CoerceOperation,
  CoerceOperationTableActionRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { BackendTypes } from '../../../../lib/backend/backend-types';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedOperationTableAction,
  NormalizeOperationTableAction,
  OperationTableAction,
} from '../../../../lib/table/action/operation-table-action';
import { OperationTableActionOptions } from './schema';

export interface NormalizedOperationTableActionOptions extends Readonly<Normalized<Omit<OperationTableActionOptions, keyof OperationTableAction | keyof AngularOptions>> & NormalizedOperationTableAction & NormalizedAngularOptions> {
  controllerName: string;
}

export function NormalizeOperationTableActionOptions(
  options: OperationTableActionOptions,
): NormalizedOperationTableActionOptions {
  const normalizedOptions = NormalizeAngularOptions(options);
  const tableActionOptions = NormalizeOperationTableAction(options);
  const { type } = tableActionOptions;
  let { controllerName, nestModule } = normalizedOptions;
  const { tableName } = options;
  nestModule ??= tableName;
  controllerName ??= BuildNestControllerName({
    controllerName: CoerceSuffix(type, '-action'),
    nestModule,
  });
  return Object.freeze({
    ...normalizedOptions,
    ...tableActionOptions,
    controllerName,
    tableName,
  });
}

function openApiOperationRule(normalizedOptions: NormalizedOperationTableActionOptions) {

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

function backendRule(normalizedOptions: NormalizedOperationTableActionOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return openApiOperationRule(normalizedOptions);

  }

  return noop();

}

function printOptions(options: NormalizedOperationTableActionOptions) {
  PrintAngularOptions('operation-table-action', options);
}

export default function (options: OperationTableActionOptions) {
  const normalizedOptions = NormalizeOperationTableActionOptions(options);

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:operation-table-action]\x1b[0m'),
      backendRule(normalizedOptions),
      () => console.groupEnd(),
    ]);

  };
}
