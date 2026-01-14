import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceOpenApiTableActionRule } from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import {
  NormalizedOpenApiTableActionOptions,
  NormalizeOpenApiTableActionOptions,
} from './normalize-open-api-table-action-options';
import { OpenApiTableActionOptions } from './schema';


function printOptions(options: NormalizedOpenApiTableActionOptions) {
  PrintAngularOptions('open-api-table-action', options);
}

export default function (options: OpenApiTableActionOptions) {
  const normalizedOptions = NormalizeOpenApiTableActionOptions(options);
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
    directory,
    type,
    operationId,
    body,
    parameters,
    scope,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:open-api-table-action]\x1b[0m'),
      CoerceOpenApiTableActionRule({
        directory: join(directory ?? '', 'methods', 'action'),
        scope,
        operationId,
        body,
        parameters,
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
      () => console.groupEnd(),
    ]);
  };
}
