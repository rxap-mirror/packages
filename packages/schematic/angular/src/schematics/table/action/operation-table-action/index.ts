import {
  chain,
  noop,
  Tree,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceOperation,
  CoerceOperationTableActionRule,
} from '@rxap/schematics-ts-morph';
import {
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { BackendTypes } from '../../../../lib/backend-types';
import { NormalizeTableActionOptions } from '../../table-action';
import { OperationTableActionOptions } from './schema';

export interface NormalizedOperationTableActionOptions
  extends Readonly<Normalized<OperationTableActionOptions> & NormalizedAngularOptions> {
  controllerName: string;
}

export function NormalizeOperationTableActionOptions(
  options: OperationTableActionOptions,
): NormalizedOperationTableActionOptions {
  const normalizedOptions = NormalizeTableActionOptions(options);
  const nestModule = options.nestModule ?? normalizedOptions.tableName;
  const context = options.context ? dasherize(options.context) : null;
  return Object.seal({
    ...normalizedOptions,
    nestModule,
    controllerName: BuildNestControllerName({
      controllerName: context,
      nestModule,
    }),
    context,
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

  switch (backend) {

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
      backendRule(normalizedOptions),
    ]);

  };
}
