import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceOpenApiTableActionRule } from '@rxap/schematics-ts-morph';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/assert-table-component-exists';
import { NormalizeTableActionOptions } from '../../table-action';
import { OpenApiTableActionOptions } from './schema';

export interface NormalizedOpenApiTableActionOptions
  extends Readonly<Normalized<OpenApiTableActionOptions> & NormalizedAngularOptions> {
  body: boolean | Record<string, string>;
  parameters: boolean | Record<string, string>;
}

export function NormalizeOpenApiTableActionOptions(
  options: Readonly<OpenApiTableActionOptions>,
): NormalizedOpenApiTableActionOptions {
  const normalizedOptions = NormalizeTableActionOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    operationId: options.operationId,
    body: options.body ?? false,
    parameters: options.parameters ?? false,
    scope: options.scope ?? null,
  });
}

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
